import { hiddenKind } from './hide.ts';
import type { InFile, Options } from './types.ts';

export const PROMPT_HEADER =
  '# INSTRUCTIONS FOR THE AI\n' +
  'Reply with code changes ONLY as a standard git unified diff inside ONE ```diff block:\n' +
  '`diff --git a/x b/x`, `--- a/x`, `+++ b/x`, `@@` hunks, 3 lines of context.\n' +
  'Use paths relative to the project root. Do not include explanations inside the block.\n\n';

const SECRETS: [RegExp, string | ((...m: string[]) => string)][] = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '[REDACTED PRIVATE KEY]'],
  [/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED AWS KEY]'],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/g, '[REDACTED GITHUB TOKEN]'],
  [/\bsk-[A-Za-z0-9_-]{20,}/g, '[REDACTED API KEY]'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/g, '[REDACTED SLACK TOKEN]'],
  [
    /\b((?:api[_-]?key|secret|token|passw(?:or)?d|private[_-]?key)\w*['"]?\s*[:=]\s*)(['"])([^'"\n]{8,})\2/gi,
    (_m, k, q) => `${k}${q}[REDACTED]${q}`,
  ],
];

export const tokens = (s: string) => Math.max(1, Math.floor(s.length / 4));

export function redact(text: string): { text: string; count: number } {
  let count = 0;
  for (const [re, rep] of SECRETS) {
    text = text.replace(re, (...m: any[]) => {
      count++;
      return typeof rep === 'string' ? rep : (rep as any)(...m);
    });
  }
  return { text, count };
}

export const compactText = (t: string) =>
  t.split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n');

interface Node { [k: string]: Node }

export function tree(paths: string[]): string {
  const root: Node = {};
  for (const p of paths) {
    let n = root;
    for (const part of p.split('/')) n = n[part] ??= {};
  }
  const lines: string[] = [];
  const walk = (n: Node, pre: string) => {
    const items = Object.entries(n).sort(([a, av], [b, bv]) => {
      const ad = Object.keys(av).length > 0, bd = Object.keys(bv).length > 0;
      return ad !== bd ? (ad ? -1 : 1) : a.toLowerCase().localeCompare(b.toLowerCase());
    });
    items.forEach(([k, v], i) => {
      const last = i === items.length - 1;
      lines.push(`${pre}${last ? '`-- ' : '|-- '}${k}${Object.keys(v).length ? '/' : ''}`);
      walk(v, pre + (last ? '    ' : '|   '));
    });
  };
  walk(root, '');
  return lines.join('\n');
}

const LANGS: Record<string, string> = {
  '.dart': 'dart', '.yaml': 'yaml', '.yml': 'yaml', '.json': 'json', '.arb': 'json', '.html': 'html',
  '.css': 'css', '.js': 'javascript', '.jsx': 'jsx', '.ts': 'typescript', '.tsx': 'tsx', '.py': 'python',
  '.sh': 'bash', '.md': 'markdown', '.txt': 'text', '.bat': 'batch', '.ps1': 'powershell', '.toml': 'toml',
  '.kt': 'kotlin', '.java': 'java', '.swift': 'swift', '.go': 'go', '.rs': 'rust', '.c': 'c', '.cpp': 'cpp', '.cs': 'csharp',
};

export function sizeStr(n: number) {
  return n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;
}

const pad = (n: number) => String(n).padStart(2, '0');
const stamp = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

export interface Report {
  parts: string[];
  tokens: number;
  redacted: number;
  bytes: number;
}

export function buildReport(name: string, files: InFile[], o: Options, now: Date = new Date()): Report {
  let redacted = 0;
  const prepared = files.map((f) => {
    const kind = hiddenKind(f.path, o);
    if (kind) return { ...f, text: `[content hidden: ${kind} file]` };
    let text = f.text;
    if (o.redact) {
      const r = redact(text);
      text = r.text;
      redacted += r.count;
    }
    if (o.compact) text = compactText(text);
    return { ...f, text };
  });
  const totalTokens = prepared.reduce((s, f) => s + tokens(f.text), 0);
  let head = o.header ? PROMPT_HEADER : '';
  head += `# PROJECT: ${name}\n# Generated: ${stamp(now)}\n`;
  if (o.tokenEstimate) head += `# FILES: ${prepared.length}   ~TOKENS: ${totalTokens.toLocaleString('en-US')}\n`;
  if (redacted) head += `# REDACTED: ${redacted} secret(s) hidden\n`;
  head += '#' + '-'.repeat(70) + '\n\n';
  if (o.tree && prepared.length) head += '## TREE\n```\n' + tree(prepared.map((f) => f.path)) + '\n```\n\n';
  const limit = o.splitBytes;
  const langOf = (path: string) => {
    const dot = path.lastIndexOf('.');
    return dot > 0 ? LANGS[path.slice(dot).toLowerCase()] || '' : '';
  };
  const text = (f: { text: string }) => f.text.replace(/\s+$/, '');
  if (!limit) {
    const body = prepared.map((f) => fileBlock(f.path, f.size, text(f), langOf(f.path))).join('');
    const out = head + body;
    return { parts: [out], tokens: totalTokens, redacted, bytes: byteLen(out) };
  }
  // Byte-accurate split: every part stays within `limit` bytes (UTF-8). A file that does not fit
  // is cut on line boundaries and continues in the next part.
  const headBytes = byteLen(head);
  const maxBlock = Math.max(limit - headBytes, Math.floor(limit / 2));
  const items: string[] = [];
  for (const f of prepared) {
    const lang = langOf(f.path);
    const whole = fileBlock(f.path, f.size, text(f), lang);
    if (byteLen(whole) <= maxBlock) { items.push(whole); continue; }
    const chunks = chunkText(text(f), maxBlock - 200 - byteLen(f.path));
    chunks.forEach((c, i) => items.push(fileBlock(f.path, f.size, c, lang, ` (part ${i + 1}/${chunks.length})`)));
  }
  const parts: string[] = [];
  let cur = head;
  let curBytes = headBytes;
  for (const b of items) {
    const bb = byteLen(b);
    if (curBytes + bb > limit && cur !== '') { parts.push(cur); cur = ''; curBytes = 0; }
    cur += b;
    curBytes += bb;
  }
  parts.push(cur);
  return { parts, tokens: totalTokens, redacted, bytes: parts.reduce((s, p) => s + byteLen(p), 0) };
}

const enc = new TextEncoder();
export const byteLen = (s: string) => enc.encode(s).length;

function fileBlock(path: string, size: number, body: string, lang: string, note = '') {
  return `---\n\n/*\nFILE:  ${path}${note}\nSIZE:  ${sizeStr(size)}\n*/\n\`\`\`${lang}\n${body}\n\`\`\`\n\n`;
}

function chunkText(body: string, room: number): string[] {
  const out: string[] = [];
  let cur: string[] = [];
  let bytes = 0;
  const flush = () => { if (cur.length) { out.push(cur.join('\n')); cur = []; bytes = 0; } };
  for (const line of body.split('\n')) {
    let rest = line;
    let lb = byteLen(rest) + 1;
    while (lb > room) { // one line longer than a whole part: cut it (UTF-8 is at most 4 bytes per char)
      flush();
      let cut = Math.max(2, Math.floor(room / 4));
      if (/[\uD800-\uDBFF]/.test(rest[cut - 1] || '')) cut -= 1;
      out.push(rest.slice(0, cut));
      rest = rest.slice(cut);
      lb = byteLen(rest) + 1;
    }
    if (bytes + lb > room) flush();
    cur.push(rest);
    bytes += lb;
  }
  flush();
  return out;
}
