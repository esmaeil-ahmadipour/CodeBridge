# Releasing

## Website
Merge to `main`. Vercel builds `apps/web` and deploys to https://codebridge.tarvix.org.
Optional switch: `NEXT_PUBLIC_ENABLE_DOWNLOADS=false` (Vercel -> Environment Variables) hides the desktop downloads and
PWA install section; they are shown by default. Redeploy after changing it.

## Desktop
Desktop versions, tags and releases are automated from the root `package.json`; see [RELEASING.md](../../../RELEASING.md).
The website's download links use
`https://github.com/esmaeil-ahmadipour/codebridge/releases/latest/download/<asset>` and need no version changes.

Binaries are unsigned (Windows SmartScreen / macOS Gatekeeper may warn). Intel macOS is not built or supported.
