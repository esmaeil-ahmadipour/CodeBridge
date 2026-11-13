import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import nextConfig from '../next.config.ts';
import { downloads, downloadConfig, getApplicationVersion, latestReleaseApi, latestReleaseUrl, platforms, releasesUrl, releaseUrl } from '../src/lib/site.ts';
import { detectPlatform } from '../src/lib/platform.ts';
import { formatReleaseDate, getLatestRelease, parseRelease } from '../src/lib/release.ts';
import { translations } from '../src/i18n/translations.ts';

const BASE = 'https://github.com/esmaeil-ahmadipour/CodeBridge/releases';
const rootPackage = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')) as { version: string };
const webPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as Record<string, unknown>;
const injectedVersion = nextConfig.env?.NEXT_PUBLIC_CODEBRIDGE_VERSION;

test('Next build injects the root application version without a web package version', () => {
  assert.equal(injectedVersion, rootPackage.version);
  assert.equal('version' in webPackage, false);
  const originalVersion = process.env.NEXT_PUBLIC_CODEBRIDGE_VERSION;
  process.env.NEXT_PUBLIC_CODEBRIDGE_VERSION = injectedVersion;
  try {
    assert.equal(getApplicationVersion(), rootPackage.version);
  } finally {
    if (originalVersion === undefined) delete process.env.NEXT_PUBLIC_CODEBRIDGE_VERSION;
    else process.env.NEXT_PUBLIC_CODEBRIDGE_VERSION = originalVersion;
  }
});

test('application version is available when GitHub release metadata is unavailable', async () => {
  const originalVersion = process.env.NEXT_PUBLIC_CODEBRIDGE_VERSION;
  const originalFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_CODEBRIDGE_VERSION = injectedVersion;
  globalThis.fetch = (async () => { throw new Error('GitHub API unavailable'); }) as typeof fetch;
  try {
    assert.equal(await getLatestRelease(), null);
    assert.equal(getApplicationVersion(), rootPackage.version);
  } finally {
    if (originalVersion === undefined) delete process.env.NEXT_PUBLIC_CODEBRIDGE_VERSION;
    else process.env.NEXT_PUBLIC_CODEBRIDGE_VERSION = originalVersion;
    globalThis.fetch = originalFetch;
  }
});

test('platform -> asset -> latest-release URL mapping', () => {
  assert.equal(downloadConfig.owner, 'esmaeil-ahmadipour');
  assert.equal(downloadConfig.repository, 'CodeBridge');
  assert.deepEqual(downloadConfig.assets, {
    windows: 'codebridge-windows-x64.zip',
    macos: 'codebridge-macos-arm64.zip',
    linux: 'codebridge-linux-x64.zip',
  });
  assert.equal(latestReleaseUrl, `${BASE}/latest`);
  assert.equal(releaseUrl, `${BASE}/latest/download`);
  assert.deepEqual(
    platforms.map((p) => [p.id, p.asset, p.arch, p.format]),
    [
      ['windows', 'codebridge-windows-x64.zip', 'x64', 'ZIP'],
      ['macos', 'codebridge-macos-arm64.zip', 'ARM64', 'ZIP'],
      ['linux', 'codebridge-linux-x64.zip', 'x64', 'ZIP'],
    ],
  );
  for (const p of platforms) {
    assert.equal(downloads[p.id], `${BASE}/latest/download/${p.asset}`);
    assert.doesNotMatch(downloads[p.id], /\/v?\d+\.\d+|\/tag\//); // never a version-specific URL
    assert.equal(downloads[p.id].includes('api.github.com'), false); // downloads never need the API
  }
  assert.equal(releasesUrl, BASE);
});

test('detectPlatform: desktop OSes, mobile and unknown fallbacks', () => {
  const win = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130';
  const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605';
  const lin = 'Mozilla/5.0 (X11; Linux x86_64) Firefox/130';
  assert.equal(detectPlatform(win), 'windows');
  assert.equal(detectPlatform('', 'Windows'), 'windows');
  assert.equal(detectPlatform(mac), null); // OS alone cannot distinguish Intel from Apple Silicon
  assert.equal(detectPlatform(mac, '', 0, 'arm', '64'), 'macos');
  assert.equal(detectPlatform(mac, '', 0, 'arm64', ''), 'macos');
  assert.equal(detectPlatform(mac, '', 0, 'x86', '64'), null);
  assert.equal(detectPlatform('', 'macOS'), null);
  assert.equal(detectPlatform('', 'macOS', 0, 'arm', '64'), 'macos');
  assert.equal(detectPlatform(lin), 'linux');
  assert.equal(detectPlatform(mac, '', 5), 'mobile'); // iPadOS pretends to be a Mac
  assert.equal(detectPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile'), 'mobile');
  assert.equal(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'), 'mobile');
  assert.equal(detectPlatform('Mozilla/5.0 (X11; CrOS x86_64 14541.0.0)'), null);
  assert.equal(detectPlatform(), null);
  assert.equal(detectPlatform('SomethingElse/1.0'), null);
});

const payload = { tag_name: 'v2.0.0', published_at: '2026-11-05T10:00:00Z', html_url: `${BASE}/tag/v2.0.0`, draft: false, prerelease: false };

test('parseRelease: valid and invalid payloads', () => {
  assert.deepEqual(parseRelease(payload), { version: 'v2.0.0', publishedAt: '2026-11-05T10:00:00Z', url: `${BASE}/tag/v2.0.0` });
  assert.equal(parseRelease(null), null);
  assert.equal(parseRelease('x'), null);
  assert.equal(parseRelease({}), null);
  assert.equal(parseRelease({ ...payload, tag_name: '' }), null);
  assert.equal(parseRelease({ ...payload, draft: true }), null);
  assert.equal(parseRelease({ ...payload, prerelease: true }), null);
  assert.equal(parseRelease({ ...payload, published_at: 'nope' })?.publishedAt, null);
  assert.equal(parseRelease({ ...payload, html_url: 'https://evil.example/x' })?.url, releasesUrl); // only trust github.com/<repo>/releases
});

test('getLatestRelease: success, HTTP errors, bad JSON and network failure all degrade to null', async () => {
  const real = globalThis.fetch;
  const calls: string[] = [];
  const mock = (impl: () => Promise<Response>) => {
    globalThis.fetch = (async (url: string) => { calls.push(String(url)); return impl(); }) as typeof fetch;
  };
  try {
    mock(async () => new Response(JSON.stringify(payload), { status: 200 }));
    assert.equal((await getLatestRelease())?.version, 'v2.0.0');
    assert.equal(calls[0], latestReleaseApi);
    mock(async () => new Response('rate limited', { status: 403 }));
    assert.equal(await getLatestRelease(), null);
    mock(async () => new Response('Not Found', { status: 404 }));
    assert.equal(await getLatestRelease(), null);
    mock(async () => new Response('<html>', { status: 200 }));
    assert.equal(await getLatestRelease(), null);
    mock(async () => { throw new Error('offline'); });
    assert.equal(await getLatestRelease(), null);
  } finally {
    globalThis.fetch = real;
  }
});

test('formatReleaseDate: locale formatting and fallback', () => {
  assert.equal(formatReleaseDate('2026-11-05T10:00:00Z', 'en'), 'Nov 5, 2026');
  assert.ok((formatReleaseDate('2026-11-05T10:00:00Z', 'fa') ?? '').length > 0);
  assert.ok((formatReleaseDate('2026-11-05T10:00:00Z', 'ar') ?? '').length > 0);
  assert.equal(formatReleaseDate(null, 'en'), null);
  assert.equal(formatReleaseDate('garbage', 'en'), null);
});

test('feature flag: downloads are on by default and only "false" disables them', async () => {
  const prev = process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS;
  try {
    for (const [value, expected] of [[undefined, true], ['false', false], ['1', true], ['true', true]] as const) {
      if (value === undefined) delete process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS; else process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS = value;
      const { flags } = await import(`../src/lib/flags.ts?v=${String(value)}`);
      assert.equal(flags.downloads, expected, `value=${String(value)}`);
    }
  } finally {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS; else process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS = prev;
  }
});

test('download UI strings exist and are non-empty in en, fa and ar', () => {
  const keys = ['desktop', 'win', 'mac', 'linux', 'appleSilicon', 'note', 'winHint', 'macHint', 'linuxHint', 'releaseChecksums',
    'recommended', 'hintDefault', 'hintMobile', 'downloadFor', 'dlAria', 'relVersion', 'relPublished'] as const;
  for (const l of ['en', 'fa', 'ar'] as const) {
    for (const k of keys) assert.ok(translations[l].download[k].trim().length > 0, `${l}.download.${k}`);
    assert.match(translations[l].download.downloadFor, /\{os\}/);
    assert.match(translations[l].download.relVersion, /\{v\}/);
    assert.match(translations[l].download.dlAria, /\{label\}.*\{arch\}.*\{format\}/);
  }
});
