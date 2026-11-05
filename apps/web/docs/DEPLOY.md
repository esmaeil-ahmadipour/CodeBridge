# Deploy (free): Vercel + your domain

No database and no server code are needed.

1. Push this folder to a new GitHub repository.
2. Vercel -> **Add New Project** -> import the repo. Framework preset: **Next.js** (auto-detected). No environment
   variables are required. Deploy.
3. Project -> **Settings -> Domains** -> add `codebridge.tarvix.org`.
4. At your DNS provider add the record Vercel shows, normally:
   `CNAME  codebridge  ->  cname.vercel-dns.com`
   (a subdomain only needs this one record; the main site is untouched).
5. Wait for the certificate (usually minutes), then open https://codebridge.tarvix.org.

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
