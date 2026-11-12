import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from '../src/i18n/translations.ts';

const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('bottom of the landing page is split into hero, download, install, support', () => {
  const page = read('../app/[locale]/page.tsx');
  const order = ['<DownloadHero', '<Download ', '<Install ', '<Help '].map((tag) => page.indexOf(tag));
  assert.ok(order.every((i) => i > 0), 'a section is missing from the page');
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'sections are out of order');
  assert.ok(page.indexOf('<Tool ') < order[0], 'the web tool stays above the download area');
});

test('hero shows the version; download keeps OS detection and release info; install has both cards', () => {
  assert.match(read('../src/components/DownloadHero.tsx'), /className="ref-badge"[^>]*>\{fmt\(t\.relVersion/);
  const dl = read('../src/components/Download.tsx');
  assert.match(dl, /<PlatformCards/);
  assert.match(dl, /latestReleaseUrl/);
  assert.match(dl, /t\.relPublished/);
  const inst = read('../src/components/Install.tsx');
  assert.match(inst, /t\.installSteps\.map/);
  assert.match(inst, /<InstallCard/);
  for (const src of [dl, inst, read('../src/components/DownloadHero.tsx')]) assert.doesNotMatch(src, /<details/);
  for (const l of ['en', 'fa', 'ar'] as const) {
    assert.equal(translations[l].download.installSteps.length, 3, l);
    assert.match(translations[l].download.relVersion, /\{v\}/, l);
  }
});

test('install cards are stacked on phones, two columns from 900px; the phone card keeps its dark palette', () => {
  const css = read('../src/index.css');
  assert.match(css, /\.ref-install-grid \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /@media \(min-width: 900px\) \{ \.ref-install-grid \{ grid-template-columns: repeat\(2/);
  assert.match(css, /\.ref-install-panel \.feat \{[^}]*--ac: #2dd4bf[^}]*--bg: #0c1117/);
  assert.doesNotMatch(css, /\.ref-download \.dl-/, 'old teal overrides for download rows must be gone');
});
