import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from '../src/i18n/translations.ts';

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('landing page keeps the hero, download, tool and support sections in order', () => {
  const page = read('../app/[locale]/page.tsx');
  const order = ['<Hero ', '<Download ', '<Tool ', '<Help '].map((tag) => page.indexOf(tag));
  assert.ok(order.every((i) => i > 0), 'a section is missing from the page');
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'sections are out of order');
});

test('hero CTA and download section retain the version, platform choices and release info', () => {
  const hero = read('../src/components/Hero.tsx');
  assert.match(hero, /downloads && <a className="ref-button ref-button-primary" href="#dl">\{t\.ctaDownload\}/);
  const dl = read('../src/components/Download.tsx');
  assert.match(dl, /<PlatformCards/);
  assert.match(dl, /latestReleaseUrl/);
  assert.match(dl, /t\.relPublished/);
  assert.match(dl, /getApplicationVersion/);
  assert.doesNotMatch(dl, /<details/);
  for (const l of ['en', 'fa', 'ar'] as const) {
    assert.ok(translations[l].download.osPrompt.trim().length > 0, l);
    assert.ok(translations[l].download.relPublished.includes('{date}'), l);
  }
});

test('mobile showcase stacks on narrow screens and download rows remain responsive', () => {
  const css = read('../src/index.css');
  assert.match(css, /\.ref-mobile-grid \{[^}]*grid-template-columns: repeat\(auto-fit/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /\.ref-mobile-grid \{ grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(css, /@media \(max-width: 760px\) \{ \.ref-downloads \.dl-rows \{ grid-template-columns: minmax\(0, 1fr\); \} \}/);
  assert.doesNotMatch(css, /\.ref-download \.dl-/, 'old teal overrides for download rows must be gone');
});
