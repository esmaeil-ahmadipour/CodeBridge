import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Every locale x page kind needs its own 1200x630 PNG (see brand/render-og.sh).
const og = (file) => fileURLToPath(new URL(`../public/og/${file}`, import.meta.url));

for (const locale of ['en', 'fa', 'ar']) {
  for (const kind of ['home', 'guide']) {
    test(`og image ${kind}-${locale}-v2.png is a 1200x630 PNG`, () => {
      const buf = readFileSync(og(`${kind}-${locale}-v2.png`));
      assert.equal(buf.subarray(1, 4).toString(), 'PNG');
      assert.equal(buf.readUInt32BE(16), 1200);
      assert.equal(buf.readUInt32BE(20), 630);
      assert.ok(buf.length < 300 * 1024, 'keep social images under 300 KB');
    });
  }
}
