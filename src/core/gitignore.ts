interface Rule {
  re: RegExp;
  neg: boolean;
  dirOnly: boolean;
}

const esc = (c: string) => c.replace(/[.+^${}()|[\]\\/]/g, '\\$&');

function body(p: string): string {
  let out = '';
  for (let i = 0; i < p.length; i++) {
    const c = p[i];
    if (c === '*') {
      if (p[i + 1] === '*') {
        const prevSlash = i === 0 || p[i - 1] === '/';
        if (prevSlash && p[i + 2] === '/') { out += '(?:.*/)?'; i += 2; continue; }
        out += '.*'; i += 1; continue;
      }
      out += '[^/]*';
    } else if (c === '?') out += '[^/]';
    else if (c === '[') {
      const j = p.indexOf(']', i + 2);
      if (j > 0) {
        let cls = p.slice(i + 1, j);
        if (cls[0] === '!') cls = '^' + cls.slice(1);
        out += '[' + cls.replace(/\\/g, '\\\\') + ']';
        i = j;
      } else out += '\\[';
    } else if (c === '\\' && i + 1 < p.length) { out += esc(p[i + 1]); i++; }
    else out += esc(c);
  }
  return out;
}

export function parseGitignore(content: string): Rule[] {
  const rules: Rule[] = [];
  for (let line of content.replace(/\r/g, '').split('\n')) {
    line = line.replace(/(?<!\\)\s+$/, '');
    if (!line || line.startsWith('#')) continue;
    let neg = false;
    if (line.startsWith('!')) { neg = true; line = line.slice(1); }
    let dirOnly = false;
    if (line.endsWith('/')) { dirOnly = true; line = line.slice(0, -1); }
    if (!line) continue;
    const anchored = line.includes('/');
    if (line.startsWith('/')) line = line.slice(1);
    const re = new RegExp((anchored ? '^' : '^(?:.*/)?') + body(line) + '$');
    rules.push({ re, neg, dirOnly });
  }
  return rules;
}

export interface IgnoreFile {
  dir: string; // '' for the root, 'sub/dir' otherwise (no trailing slash)
  content: string;
}

/** Returns a predicate: is this file ignored? Honors nested .gitignore files, negation and parent dirs. */
export function createIgnore(files: IgnoreFile[]): (path: string) => boolean {
  const sets = files
    .map((f) => ({ dir: f.dir, rules: parseGitignore(f.content) }))
    .sort((a, b) => a.dir.length - b.dir.length);
  const test = (path: string, isDir: boolean) => {
    let ignored = false;
    for (const s of sets) {
      if (s.dir && !path.startsWith(s.dir + '/')) continue;
      const rel = s.dir ? path.slice(s.dir.length + 1) : path;
      for (const r of s.rules) {
        if (r.dirOnly && !isDir) continue;
        if (r.re.test(rel)) ignored = !r.neg;
      }
    }
    return ignored;
  };
  return (path: string) => {
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) {
      if (test(parts.slice(0, i).join('/'), true)) return true;
    }
    return test(path, false);
  };
}
