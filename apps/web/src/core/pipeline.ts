import { createIgnore, type IgnoreFile } from './gitignore.ts';
import { commonRoot, decodeText, extOf, skipPath } from './select.ts';
import type { Entry, InFile, LoadStats, Options } from './types.ts';

/** Select, read and decode the files of a project (pure: no DOM, no network). */
export async function loadFiles(
  entries: Entry[],
  o: Options,
  onProgress?: (done: number, total: number) => void,
): Promise<{ files: InFile[]; stats: LoadStats; root: string }> {
  const clean = entries
    .map((e) => ({ ...e, path: e.path.replace(/\\/g, '/').replace(/^\/+/, '') }))
    .filter((e) => e.path && !e.path.endsWith('/'));
  const root = commonRoot(clean.map((e) => e.path));
  const items = clean.map((e) => ({ ...e, path: e.path.slice(root.length) })).filter((e) => e.path);
  items.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  let ignored: (p: string) => boolean = () => false;
  if (o.useGitignore) {
    const igs: IgnoreFile[] = [];
    for (const e of items) {
      if (e.path === '.gitignore' || e.path.endsWith('/.gitignore')) {
        const text = decodeText(await e.read());
        if (text !== null) igs.push({ dir: e.path.slice(0, -'.gitignore'.length).replace(/\/$/, ''), content: text });
      }
    }
    if (igs.length) ignored = createIgnore(igs);
  }

  const exts = o.extensions.map((x) => x.toLowerCase());
  const limit = o.maxFileKb ? o.maxFileKb * 1024 : 0;
  const stats: LoadStats = { total: items.length, skipped: 0, binary: 0, large: 0, kept: 0 };
  const cands = items.filter((e) => {
    const skip = skipPath(e.path, o) || ignored(e.path) || (exts.length > 0 && !exts.includes(extOf(e.path)));
    if (skip) stats.skipped++;
    return !skip;
  });

  const files: InFile[] = [];
  let done = 0;
  for (const e of cands) {
    onProgress?.(done++, cands.length);
    if (limit && e.size !== undefined && e.size > limit) { stats.large++; continue; }
    const bytes = await e.read();
    if (limit && bytes.length > limit) { stats.large++; continue; }
    const text = decodeText(bytes);
    if (text === null) { stats.binary++; continue; }
    files.push({ path: e.path, size: bytes.length, text });
  }
  onProgress?.(cands.length, cands.length);
  stats.kept = files.length;
  return { files, stats, root: root.replace(/\/$/, '') };
}
