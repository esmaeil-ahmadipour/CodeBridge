# Deploy to Vercel

Import the repository root and use these project settings:

| Setting | Value |
| --- | --- |
| Root Directory | `apps/web` |
| Framework Preset | `Next.js` |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build` |
| Output Directory | Leave the default (do not override) |

The root `pnpm-workspace.yaml` and `pnpm-lock.yaml` define dependency resolution. Vercel detects the workspace lockfile while building the app from `apps/web`. Do not add a nested lockfile or a custom `vercel.json`; Next.js integration handles the `.next` output and the existing redirects, rewrites, and headers.

No environment variables are required. To customize metadata URLs, set `NEXT_PUBLIC_SITE_URL`; to show desktop downloads, set `NEXT_PUBLIC_ENABLE_DOWNLOADS=true`. Both are public build-time variables, so set them for each Vercel environment that needs the value and redeploy after changing them. Safe local defaults are in `.env.example`; do not store secrets in `NEXT_PUBLIC_*` variables.

No `outputFileTracingRoot` or `turbopack.root` override is needed: the app has no imports from outside `apps/web`, and the framework can infer the workspace from the root lockfile. TypeScript aliases resolve relative to the app's `tsconfig.json`. Fonts and PWA assets are in `public/` and use root-relative URLs. Locale routes, the global not-found page, and the rewrite/redirect behavior are built into the app's normal Next.js output.

After deploying, set the project domain under **Settings -> Domains**. Bump `VERSION` in `public/sw.js` when installed copies should discard their old cache.

## Verify the deployment

- Open the site on a phone: Android Chrome shows the install button; on iPhone use Safari -> Share -> Add to Home Screen.
- Open DevTools -> Network, convert a ZIP: there must be no request carrying your files.
- Switch language and theme; reload and confirm both are remembered.
- Lighthouse (mobile): check PWA, accessibility and SEO.

Notes
- Pages are statically generated; Vercel serves them from its CDN. `rewrites`/`redirects`/headers in `next.config.ts`
  are handled by Vercel, so keep hosting on Vercel (GitHub Pages cannot run them).
- Changing the site later: push to GitHub; Vercel redeploys. Bump `VERSION` in `public/sw.js` when you want installed
  copies to drop their old cache.

Checks after the first deploy
- Open the site on a phone: Android Chrome shows the install button; on iPhone use Safari -> Share -> Add to Home Screen.
- Open DevTools -> Network, convert a ZIP: there must be no request carrying your files.
- Switch language and theme; reload and confirm both are remembered.
- Lighthouse (mobile): check PWA, accessibility and SEO.
