import test from 'node:test';
import assert from 'node:assert/strict';
import { createIgnore } from '../src/core/gitignore.ts';
import { commonRoot, decodeText, skipPath } from '../src/core/select.ts';
import { buildReport, byteLen, redact, tree } from '../src/core/report.ts';
import { loadFiles } from '../src/core/pipeline.ts';
import { defaultOptions } from '../src/core/presets.ts';
import type { Entry } from '../src/core/types.ts';

const enc = (s: string) => new TextEncoder().encode(s);
const entries = (m: Record<string, string | Uint8Array>): Entry[] =>
  Object.entries(m).map(([path, v]) => ({
    path,
    size: typeof v === 'string' ? enc(v).length : v.length,
    read: async () => (typeof v === 'string' ? enc(v) : v),
  }));

test('gitignore: basics, dirs, negation, nesting, **', () => {
  const ig = createIgnore([
    { dir: '', content: '*.log\nbuild/\n/root-only.txt\n!keep.log\n**/cache/**\ndocs/*.md\n' },
    { dir: 'sub', content: 'secret.txt\n' },
  ]);
  assert.ok(ig('a.log') && ig('x/y/b.log'));
  assert.ok(!ig('keep.log'));
  assert.ok(ig('build/out.js') && ig('src/build/out.js'));
  assert.ok(ig('root-only.txt') && !ig('sub/root-only.txt'));
  assert.ok(ig('a/cache/z/q.txt'));
  assert.ok(ig('docs/a.md') && !ig('docs/deep/a.md'));
  assert.ok(ig('sub/secret.txt') && !ig('secret.txt') && !ig('other/secret.txt'));
});

test('skipPath mirrors the desktop rules', () => {
  const o = defaultOptions();
  assert.ok(skipPath('node_modules/x/y.js', o));
  assert.ok(skipPath('.env.local', o));
  assert.ok(!skipPath('pnpm-lock.yaml', o)); // lock files are listed; hiding is a dialog option
  assert.ok(skipPath('lib/a.g.dart', o));
  assert.ok(skipPath('.hidden/x.txt', o));
  assert.ok(!skipPath('.gitignore', o));
  assert.ok(!skipPath('src/main.ts', o));
});

test('commonRoot strips a single top folder only', () => {
  assert.equal(commonRoot(['app-main/a.txt', 'app-main/b/c.txt']), 'app-main/');
  assert.equal(commonRoot(['a.txt', 'b/c.txt']), '');
  assert.equal(commonRoot(['x/a.txt', 'y/b.txt']), '');
});

test('decodeText: utf8, bom, utf16, binary, cp1256', () => {
  assert.equal(decodeText(enc('سلام')), 'سلام');
  assert.equal(decodeText(new Uint8Array([0xef, 0xbb, 0xbf, 0x68, 0x69])), 'hi');
  assert.equal(decodeText(new Uint8Array([0xff, 0xfe, 0x68, 0x00, 0x69, 0x00])), 'hi');
  assert.equal(decodeText(new Uint8Array([0x89, 0x50, 0x00, 0x01])), null);
  assert.ok((decodeText(new Uint8Array([0xc7, 0xe1, 0xd3])) || '').length === 3);
});

test('redact secrets', () => {
  const r = redact('api_key = "abcdefgh12345678"\nAKIAABCDEFGHIJKLMNOP\n"token": "zzzzzzzz9999"\nok = "short"');
  assert.equal(r.count, 3);
  assert.ok(!r.text.includes('abcdefgh') && !r.text.includes('zzzzzzzz') && r.text.includes('short'));
  assert.equal(redact('-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----').count, 1);
});

test('tree prints folders first', () => {
  assert.equal(tree(['b.txt', 'a/x.txt']), '|-- a/\n|   `-- x.txt\n`-- b.txt');
});

test('pipeline: root strip, gitignore, skip, binary, large, ext', async () => {
  const o = defaultOptions();
  const e = entries({
    'proj-main/.gitignore': 'ignored.txt\n',
    'proj-main/a.ts': 'const a = 1;',
    'proj-main/ignored.txt': 'x',
    'proj-main/node_modules/m.js': 'm',
    'proj-main/img.png': new Uint8Array([1, 0, 2]),
    'proj-main/big.txt': 'x'.repeat(2048),
    'proj-main/.env': 'SECRET=1',
    'proj-main/dir/': new Uint8Array(0),
  });
  const r = await loadFiles(e, { ...o, maxFileKb: 1 });
  assert.deepEqual(r.files.map((f) => f.path), ['.gitignore', 'a.ts']);
  assert.equal(r.stats.binary, 1);
  assert.equal(r.stats.large, 1);
  assert.equal(r.root, 'proj-main');
  const only = await loadFiles(e, { ...o, extensions: ['.ts'] });
  assert.deepEqual(only.files.map((f) => f.path), ['a.ts']);
  const noIg = await loadFiles(e, { ...o, useGitignore: false });
  assert.ok(noIg.files.some((f) => f.path === 'ignored.txt'));
});

test('buildReport: header, redaction, no abs path, split', () => {
  const o = defaultOptions();
  const files = [{ path: 'a.py', size: 20, text: 'token = "supersecret99"\n' }];
  const rep = buildReport('p', files, o, new Date(2026, 0, 2, 3, 4, 5));
  assert.equal(rep.redacted, 1);
  assert.ok(rep.parts[0].includes('INSTRUCTIONS FOR THE AI') && rep.parts[0].includes('2026-01-02 03:04:05'));
  assert.ok(!rep.parts[0].includes('supersecret99') && rep.parts[0].includes('FILE:  a.py'));
  const many = Array.from({ length: 6 }, (_, i) => ({ path: `f${i}.txt`, size: 400, text: 'x'.repeat(400) }));
  const split = buildReport('p', many, { ...o, splitBytes: 1800 });
  assert.ok(split.parts.length > 1 && split.parts.every((p) => byteLen(p) <= 1800));
  const none = buildReport('p', many, { ...o, header: false, tree: false });
  assert.ok(!none.parts[0].includes('INSTRUCTIONS') && !none.parts[0].includes('## TREE'));
});

test('byte split: every part within the limit, big files continue, nothing is lost', () => {
  const o = { ...defaultOptions(), header: false };
  const big = Array.from({ length: 400 }, (_, i) => `line ${i} سلام ${'y'.repeat(30)}`).join('\n');
  const files = [{ path: 'a.txt', size: 10, text: 'small' }, { path: 'big.txt', size: big.length, text: big }];
  for (const limit of [4000, 10000]) {
    const r = buildReport('p', files, { ...o, splitBytes: limit });
    assert.ok(r.parts.length > 1);
    assert.ok(r.parts.every((p) => byteLen(p) <= limit), `limit ${limit}`);
    const got = r.parts
      .flatMap((p) => [...p.matchAll(/FILE:  big\.txt[^\n]*\nSIZE:[^\n]*\n\*\/\n```text\n([\s\S]*?)\n```/g)].map((m) => m[1]))
      .join('\n');
    assert.equal(got, big);
  }
  const one = buildReport('p', files, { ...o, splitBytes: 0 });
  assert.equal(one.parts.length, 1);
  assert.equal(one.bytes, byteLen(one.parts[0]));
});

test('byte split: a single very long line is cut, not dropped', () => {
  const o = { ...defaultOptions(), header: false, tree: false, tokenEstimate: false };
  const line = '😀'.repeat(3000);
  const r = buildReport('p', [{ path: 'x.txt', size: 1, text: line }], { ...o, splitBytes: 4000 });
  assert.ok(r.parts.every((p) => byteLen(p) <= 4000));
  const got = r.parts.flatMap((p) => [...p.matchAll(/```text\n([\s\S]*?)\n```/g)].map((m) => m[1])).join('');
  assert.equal(got, line);
});

test('hide: image and lock content are replaced, paths stay', () => {
  const files = [
    { path: 'a.svg', size: 9, text: '<svg>SECRETPIXELS</svg>' },
    { path: 'package-lock.json', size: 9, text: '{"lockdata":1}' },
    { path: 'poetry.lock', size: 9, text: 'pylock' },
    { path: 'src/a.ts', size: 9, text: 'const a = 1;' },
    { path: 'src/a.test.ts', size: 9, text: 'TESTBODY' },
    { path: 'tests/helper.ts', size: 9, text: 'HELPERBODY' },
    { path: 'src/latest.ts', size: 9, text: 'KEEPME' },
  ];
  const base = { ...defaultOptions(), header: false };
  const none = buildReport('p', files, base).parts.join('');
  assert.ok(none.includes('SECRETPIXELS') && none.includes('lockdata')); // no project type: nothing hidden
  const o = { ...base, hideImages: true, hideLocks: true, project: 'node' as const, hideTests: true };
  const out = buildReport('p', files, o).parts.join('');
  assert.ok(!out.includes('SECRETPIXELS') && !out.includes('lockdata'));
  assert.ok(!out.includes('TESTBODY') && !out.includes('HELPERBODY') && out.includes('KEEPME'));
  const noProj = buildReport('p', files, { ...base, hideLocks: true, hideTests: true }).parts.join('');
  assert.ok(noProj.includes('lockdata') && noProj.includes('TESTBODY')); // lock/test switches do nothing without a project type
  const py = buildReport('p', [{ path: 'tests/test_a.py', size: 1, text: 'PYTEST' }, { path: 'src/a.test.ts', size: 1, text: 'TSTEST' }], { ...base, hideTests: true, project: 'python' as const }).parts.join('');
  assert.ok(!py.includes('PYTEST') && py.includes('TSTEST')); // test rules follow the chosen project type
  assert.ok(out.includes('pylock')); // another project type's lock file is untouched
  assert.ok(out.includes('const a = 1;') && out.includes('a.svg') && out.includes('[content hidden: image file]'));
});
