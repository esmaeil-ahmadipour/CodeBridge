import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translations } from '../src/i18n/translations.ts';
import { guideIds, guideShots, helpTargets } from '../src/lib/guide.ts';

const locales = ['en', 'fa', 'ar'] as const;
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };

test('guide has the same sections in every language', () => {
  for (const l of locales) {
    assert.deepEqual(translations[l].guide.sections.map((s) => s.id), [...guideIds], l);
  }
});

test('guide sections have the same shape in every language', () => {
  const en = translations.en.guide.sections;
  for (const l of locales) {
    translations[l].guide.sections.forEach((s, i) => {
      assert.ok(s.title.trim() && s.intro.trim(), `${l}/${s.id} title and intro`);
      for (const k of ['steps', 'keys', 'notes', 'qa'] as const) {
        assert.equal(s[k]?.length, en[i][k]?.length, `${l}/${s.id}/${k} length`);
      }
      // Keys and commands are language-neutral: identical everywhere.
      assert.deepEqual(s.keys?.map((x) => x.t), en[i].keys?.map((x) => x.t), `${l}/${s.id} keys`);
      for (const p of [...(s.keys ?? []), ...(s.qa ?? [])]) assert.ok(p.t.trim() && p.s.trim(), `${l}/${s.id} pair`);
    });
  }
});

test('help cards point at existing guide sections and exist in every language', () => {
  for (const id of helpTargets) assert.ok((guideIds as readonly string[]).includes(id), id);
  for (const l of locales) {
    assert.equal(translations[l].help.items.length, helpTargets.length, l);
    assert.ok(translations[l].help.cta.trim() && translations[l].nav.guide.trim(), l);
    assert.ok(translations[l].guide.metadata.title.trim() && translations[l].guide.metadata.description.trim(), l);
  }
});

test('terminal screens belong to real sections, fit a phone scroll area and match the version', () => {
  for (const [id, shots] of Object.entries(guideShots)) {
    assert.ok((guideIds as readonly string[]).includes(id), id);
    for (const s of shots) {
      assert.ok(s.title && s.text.trim(), id);
      for (const line of s.text.split('\n')) assert.ok(line.length <= 80, `${id}: line too long: ${line}`);
    }
  }
  assert.match(guideShots.menu[0].text, new RegExp(`CodeBridge ${pkg.version.replace(/\./g, '\\.')} `));
});

test('site version is 3.x and the service worker cache was bumped', () => {
  assert.equal(pkg.version, '3.0.0');
  const sw = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(sw, /VERSION = 'cb-v3'/);
  assert.match(sw, /'\/guide'/);
});
