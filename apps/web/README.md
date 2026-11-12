# CodeBridge website

Landing page + a browser-only tool that turns a project ZIP into one AI-ready text file.
Next.js (App Router) + React + Tailwind v4, 3 languages (en, fa, ar), light and dark themes, installable PWA.
Reuses the structure of the portfolio site (theme + i18n + SEO), with the CodeBridge palette and fonts.

## Privacy by construction
- The conversion runs entirely in the browser (JSZip + `src/core`). There is **no API route** and no server code for files.
- Production responses send `Content-Security-Policy: connect-src 'self'` (see `next.config.ts`), so the browser itself
  blocks this page from sending data to any other server.
- Keep it that way: do not add analytics, trackers or `fetch` calls that carry file content, and keep JSZip bundled
  (no third-party script tags).

## Develop
```text
# Install dependencies from the repository root once: pnpm install
pnpm dev             # http://localhost:3000   (/fa, /ar for the other languages)
pnpm test            # pure logic tests (Node >= 22.18)
pnpm typecheck
pnpm check
pnpm build && pnpm start
```
These commands also work from the repository root through its workspace scripts. Next.js 16 no longer has `next lint`; `pnpm check` is the project check, combining TypeScript validation and the test suite.

## Version and releases
The root `package.json` is the only application version source. Desktop packaging synchronizes it with
`scripts/sync_version.py`; the web build reads it from the repository root in `next.config.ts` and injects it into
the app at build time. The displayed application version does not come from GitHub Releases: GitHub supplies
release-specific metadata, and the download buttons continue to use the latest-release asset URLs.

## Structure
```text
app/[locale]/        layout (html lang/dir, theme init) and the landing page
app/[locale]/guide/  the desktop app guide (terminal screens, all steps, fixes)
app/                 manifest (PWA), sitemap, robots, icons, 404
src/core/            ZIP -> text logic: .gitignore, filters, redaction, tokens, tree, split (pure TypeScript)
src/components/      Navbar, Hero, Features, MobileShowcase, HowItWorks, Privacy, Tool, Download, InstallCard, Help, Guide, Footer
src/lib/guide.ts     terminal screens used by the guide (keep in sync with apps/desktop)
src/i18n/            locales + all texts (en, fa, ar)
src/context/         ThemeContext, LanguageContext
src/index.css        design tokens (light/dark) and styles
public/sw.js         service worker (offline); bump VERSION on each release
tests/               core logic + translation consistency
```

## Before going live
1. `src/lib/site.ts`: set `repoUrl` to the real GitHub repository. The download buttons point to
   `releases/latest/download/codebridge-windows-x64.zip`, `codebridge-macos-arm64.zip` and `codebridge-linux-x64.zip`,
   the asset names produced by the CodeBridge release workflow. They always resolve to the newest stable release, so new
   releases need no website change.
2. No manually configured version variable is required. Optional `NEXT_PUBLIC_SITE_URL` (defaults to `https://codebridge.tarvix.org`) and `NEXT_PUBLIC_ENABLE_DOWNLOADS` (defaults to `false`) are read at build time. The application version is injected from the root `package.json`. See `.env.example` for safe local values.

3. Downloads are **off** by default. Set `NEXT_PUBLIC_ENABLE_DOWNLOADS=true` in the relevant Vercel environment and rebuild
   to show the Download section, its nav link and the hero download button once a release exists.

Deployment steps: [docs/DEPLOY.md](docs/DEPLOY.md).
