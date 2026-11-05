import type { PlatformId } from './site.ts';

export type Detected = PlatformId | 'mobile' | null;

/**
 * Best-effort OS detection for choosing the recommended download.
 * Returns null when unsure (e.g. ChromeOS, unknown) so the UI shows the neutral fallback.
 * CPU architecture is never guessed: browsers do not expose it reliably (Apple Silicon reports as Intel).
 */
export function detectPlatform(ua = '', uaPlatform = '', touchPoints = 0): Detected {
  const p = uaPlatform.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile/i.test(ua)) return 'mobile';
  if (/cros/i.test(ua)) return null;
  if (/mac/i.test(p) || /macintosh|mac os x/i.test(ua)) return touchPoints > 1 ? 'mobile' : 'macos'; // iPadOS looks like a Mac
  if (/win/i.test(p) || /windows nt/i.test(ua)) return 'windows';
  if (/linux/i.test(p) || /linux|x11/i.test(ua)) return 'linux';
  return null;
}
