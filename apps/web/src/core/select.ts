import { globMatch } from './glob.ts';
import type { Options } from './types.ts';

const ALLOWED_HIDDEN = new Set(['.gitignore', '.gitattributes', '.gitkeep']);

/** Common single top-level folder of a ZIP (e.g. "repo-main/"), or '' when there is none. */
export function commonRoot(paths: string[]): string {
  if (!paths.length) return '';
  const first = paths[0].split('/')[0];
  if (!paths.every((p) => p.includes('/') && p.split('/')[0] === first)) return '';
  return first + '/';
}

export function skipPath(rel: string, o: Pick<Options, 'skipFolders' | 'skipFiles' | 'skipContains' | 'includeHidden'>): boolean {
  const parts = rel.split('/');
  const dirs = parts.slice(0, -1);
  for (let i = 0; i < dirs.length; i++) {
    const sub = parts.slice(0, i + 1).join('/');
    if (o.skipFolders.some((p) => globMatch(p, dirs[i]) || globMatch(p, sub))) return true;
  }
  if (o.skipFiles.some((p) => globMatch(p, parts[parts.length - 1]))) return true;
  const low = rel.toLowerCase();
  if (o.skipContains.some((p) => low.includes(p.toLowerCase()))) return true;
  if (!o.includeHidden && parts.some((p) => p.startsWith('.') && !ALLOWED_HIDDEN.has(p))) return true;
  return false;
}

export const extOf = (path: string) => {
  const name = path.split('/').pop() || '';
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i).toLowerCase() : '';
};

/** Decode bytes as text, or null for binary files. UTF-8, UTF-16 (BOM), then Windows-1256 (Persian/Arabic). */
export function decodeText(b: Uint8Array): string | null {
  const bom16 = (b[0] === 0xff && b[1] === 0xfe) || (b[0] === 0xfe && b[1] === 0xff);
  if (!bom16 && b.subarray(0, 8192).includes(0)) return null;
  if (bom16) return new TextDecoder(b[0] === 0xff ? 'utf-16le' : 'utf-16be').decode(b);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(b).replace(/^\uFEFF/, '');
  } catch {
    /* not utf-8 */
  }
  try {
    return new TextDecoder('windows-1256').decode(b);
  } catch {
    return new TextDecoder('utf-8').decode(b);
  }
}
