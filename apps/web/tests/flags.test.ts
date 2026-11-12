import test from 'node:test';
import assert from 'node:assert/strict';

// flags.ts reads the env var once at import time, so each case imports a fresh copy of the module.
async function downloadsFlag(value: string | undefined, n: number): Promise<boolean> {
  if (value === undefined) delete process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS;
  else process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS = value;
  return (await import(`../src/lib/flags.ts?case=${n}`)).flags.downloads;
}

test('downloads and the PWA install section are on by default and only "false" hides them', async () => {
  const saved = process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS;
  try {
    assert.equal(await downloadsFlag(undefined, 1), true);
    assert.equal(await downloadsFlag('true', 2), true);
    assert.equal(await downloadsFlag('', 3), true);
    assert.equal(await downloadsFlag('false', 4), false);
  } finally {
    if (saved === undefined) delete process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS;
    else process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS = saved;
  }
});
