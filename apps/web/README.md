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

## Structure
```text
app/[locale]/        layout (html lang/dir, theme init) and the single page
app/                 manifest (PWA), sitemap, robots, icons, 404
src/core/            ZIP -> text logic: .gitignore, filters, redaction, tokens, tree, split (pure TypeScript)
src/components/      Navbar, Hero, Tool, Privacy, Features, Download, InstallCard, Footer
src/i18n/            locales + all texts (en, fa, ar)
src/context/         ThemeContext, LanguageContext
src/index.css        design tokens (light/dark) and styles
public/sw.js         service worker (offline); bump VERSION on each release
tests/               core logic + translation consistency
```

## Before going live
1. `src/lib/site.ts`: set `repoUrl` to the real GitHub repository. The download buttons point to
   `releases/latest/download/codebridge-windows-x64.exe`, `codebridge-macos-arm64` and `codebridge-linux-x64`,
   which are the asset names produced by the CodeBridge release workflow.
2. No environment variables are required. Optional `NEXT_PUBLIC_SITE_URL` (defaults to `https://codebridge.tarvix.org`) and `NEXT_PUBLIC_ENABLE_DOWNLOADS` (defaults to `false`) are read at build time. See `.env.example` for safe local values.

3. Downloads are **off** by default. Set `NEXT_PUBLIC_ENABLE_DOWNLOADS=true` in the relevant Vercel environment and rebuild
   to show the Download section, its nav link and the hero download button once a release exists.

Deployment steps: [docs/DEPLOY.md](docs/DEPLOY.md).
