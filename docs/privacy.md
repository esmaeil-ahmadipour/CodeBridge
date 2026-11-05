# Privacy promise

> Your code never leaves your device.

**Web.** The conversion runs in the browser. There is no upload and no server code that touches files.
Production responses send `Content-Security-Policy: connect-src 'self'`, so the browser blocks this page from sending data elsewhere.
The page works offline after the first load.

**Desktop.** Everything is local. The tool makes no network requests (Git only talks to remotes if you ask it to).

**Rules for contributors**
1. No analytics, trackers, or third-party scripts on the website.
2. No request that carries file names, contents or sizes.
3. Keep `connect-src 'self'` in the production CSP (`apps/web/next.config.ts`).
4. Secret hiding in reports is best-effort; never claim it is perfect.
