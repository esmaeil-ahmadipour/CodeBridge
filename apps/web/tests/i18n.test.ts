import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from '../src/i18n/translations.ts';

type Tree = string | Tree[] | { [k: string]: Tree };
const shape = (v: Tree): unknown =>
  typeof v === 'string' ? 'str' : Array.isArray(v) ? v.map(shape) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)]));
const strings = (v: Tree, path = ''): [string, string][] =>
  typeof v === 'string' ? [[path, v]] : Array.isArray(v) ? v.flatMap((x, i) => strings(x, `${path}[${i}]`)) : Object.entries(v).flatMap(([k, x]) => strings(x, `${path}.${k}`));
const vars = (s: string) => (s.match(/\{\w+\}/g) || []).sort().join(',');

test('all locales share the same keys, array lengths and placeholders', () => {
  const en = translations.en as unknown as Tree;
  for (const l of ['fa', 'ar'] as const) {
    const other = translations[l] as unknown as Tree;
    assert.deepEqual(shape(other), shape(en), `${l} shape differs`);
    const a = Object.fromEntries(strings(en));
    for (const [path, s] of strings(other)) {
      assert.ok(s.trim().length > 0, `${l}${path} is empty`);
      assert.equal(vars(s), vars(a[path]), `${l}${path} placeholders differ`);
    }
  }
});
