const cache = new Map<string, RegExp>();
const esc = (c: string) => c.replace(/[.+^${}()|\\/]/g, '\\$&');

/** fnmatch-style glob (`*` also matches `/`, `?`, `[seq]`) as a whole-string regex. */
export function globToRegex(glob: string): RegExp {
  const hit = cache.get(glob);
  if (hit) return hit;
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') out += '.*';
    else if (c === '?') out += '.';
    else if (c === '[') {
      const j = glob.indexOf(']', i + 2);
      if (j > 0) {
        let cls = glob.slice(i + 1, j);
        if (cls[0] === '!') cls = '^' + cls.slice(1);
        out += '[' + cls.replace(/\\/g, '\\\\') + ']';
        i = j;
      } else out += '\\[';
    } else out += esc(c);
  }
  const re = new RegExp('^' + out + '$');
  cache.set(glob, re);
  return re;
}

export const globMatch = (glob: string, s: string) => globToRegex(glob).test(s);
