# Deploy to Vercel

Import the repository root and use these project settings:

| Setting | Value |
| --- | --- |
| Root Directory | `apps/web` |
| Framework Preset | `Next.js` |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build` |
| Output Directory | Leave the default (do not override) |

The root `pnpm-workspace.yaml` and `pnpm-lock.yaml` define dependency resolution. Vercel detects the workspace lockfile while building the app from `apps/web`; the repository checkout also makes the root `package.json` available to `next.config.ts` at `../../package.json`. Do not add a nested lockfile or a custom `vercel.json`; Next.js integration handles the `.next` output and the existing redirects, rewrites, and headers.

No manually configured version environment variable is required: `next.config.ts` reads the root version and injects `NEXT_PUBLIC_CODEBRIDGE_VERSION` at build time. The localized version label uses it directly. To customize metadata URLs, set `NEXT_PUBLIC_SITE_URL`; desktop downloads are shown by default, so set `NEXT_PUBLIC_ENABLE_DOWNLOADS=false` only to hide them. Both are public build-time variables, so set them for each Vercel environment that needs the value and redeploy after changing them. Safe local defaults are in `.env.example`; do not store secrets in `NEXT_PUBLIC_*` variables.

No `outputFileTracingRoot` or `turbopack.root` override is needed: the app has no source imports from outside `apps/web`, and the framework can infer the workspace from the root lockfile. `next.config.ts` reads the root manifest during the build from the repository checkout. TypeScript aliases resolve relative to the app's `tsconfig.json`. Fonts and PWA assets are in `public/` and use root-relative URLs. Locale routes, the global not-found page, and the rewrite/redirect behavior are built into the app's normal Next.js output.

After deploying, set the project domain under **Settings -> Domains**. Bump `VERSION` in `public/sw.js` when installed copies should discard their old cache.

## Verify the deployment

- Open the site on a phone: Android Chrome shows the install button; on iPhone use Safari -> Share -> Add to Home Screen.
- Open DevTools -> Network, convert a ZIP: there must be no request carrying your files.
- Switch language and theme; reload and confirm both are remembered.
- Lighthouse (mobile): check PWA, accessibility and SEO.

Notes
- Pages are statically generated; Vercel serves them from its CDN. `rewrites`/`redirects`/headers in `next.config.ts`
  are handled by Vercel, so keep hosting on Vercel (GitHub Pages cannot run them).
- The guide lives at `/guide`, `/fa/guide` and `/ar/guide`. When the desktop menu changes, update the screens in
  `src/lib/guide.ts` and the texts in `src/i18n/translations.ts` (`guide`); change the root `package.json` version
  for a user-facing release.
- Changing the site later: push to GitHub; Vercel redeploys. Bump `VERSION` in `public/sw.js` when you want installed
  copies to drop their old cache.

Desktop downloads (shown unless `NEXT_PUBLIC_ENABLE_DOWNLOADS=false`)
- The Download section lists Windows x64, macOS ARM64 and Linux x64 ZIPs. Each button links to
  `https://github.com/esmaeil-ahmadipour/codebridge/releases/latest/download/<asset>`, so new releases need no redeploy.
- The shown application version comes from the root `package.json` at build time. The GitHub Releases API supplies only
  release-specific metadata such as the published date; if it is rate-limited or unreachable, the application version
  and download buttons still work. The page and API response revalidate hourly. Optionally set a server-only
  `GITHUB_TOKEN` (no scopes needed) to avoid anonymous rate limits. Never prefix it with `NEXT_PUBLIC_`.

Checks after the first deploy
- Open the site on a phone: Android Chrome shows the install button; on iPhone use Safari -> Share -> Add to Home Screen.
- Open DevTools -> Network, convert a ZIP: there must be no request carrying your files.
- Switch language and theme; reload and confirm both are remembered.
- Lighthouse (mobile): check PWA, accessibility and SEO.
