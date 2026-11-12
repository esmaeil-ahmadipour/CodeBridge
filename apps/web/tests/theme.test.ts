import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const block = (sel: string) => css.slice(css.indexOf(sel), css.indexOf('}', css.indexOf(sel))).match(/--[\w-]+(?=:)/g) ?? [];
const rule = (sel: string) => css.split('\n').find((l) => l.startsWith(`${sel} {`)) ?? '';

test('light and dark define exactly the same design tokens', () => {
  const light = block(":root, [data-theme='light']").sort();
  const dark = block("[data-theme='dark']").sort();
  assert.ok(light.length >= 15, 'tokens missing');
  assert.deepEqual(dark, light);
});

test('theme-dependent landing parts use tokens, not fixed dark colors', () => {
  for (const sel of ['.ref-diff-removed', '.ref-diff-added', '.ref-preview-result', '.ref-undo', '.ref-mobile-grid', '.ref-preview']) {
    const r = rule(sel);
    assert.ok(r, `${sel} rule not found`);
    assert.doesNotMatch(r, /#[0-9a-f]{3,8}\b/i, `${sel} has a fixed color`);
  }
});

test('hero card text follows the page direction; only the code is forced LTR', () => {
  const hero = readFileSync(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(hero, /dir="rtl"/);
  assert.match(hero, /className="ref-code" dir="ltr"/);
});
