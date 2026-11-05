import test from 'node:test';
import assert from 'node:assert/strict';
import { downloads, releaseUrl } from '../src/lib/site.ts';

test('download links are permanent latest-release ZIP URLs', () => {
  assert.match(releaseUrl, /\/releases\/latest\/download$/);
  assert.deepEqual(downloads, {
    windows: `${releaseUrl}/codebridge-windows-x64.zip`,
    macos: `${releaseUrl}/codebridge-macos-arm64.zip`,
    linux: `${releaseUrl}/codebridge-linux-x64.zip`,
  });
  for (const url of Object.values(downloads)) assert.doesNotMatch(url, /\/v\d|\d+\.\d+\.\d+/);
});
