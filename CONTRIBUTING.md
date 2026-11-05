# Contributing

- **One app per change** when possible. Commit messages start with a scope: `web: ...`, `desktop: ...`, `docs: ...`, `ci: ...`.
- **Run the tests of the app you touched**
  - web: `cd apps/web && pnpm test && pnpm typecheck`
  - desktop: `cd apps/desktop && python -m unittest discover -s tests`
- **Privacy rules (web):** no analytics, no trackers, no request that carries file content, no third-party scripts.
  The production CSP uses `connect-src 'self'`; keep it. See [docs/privacy.md](docs/privacy.md).
- **Releases:** desktop only, by tag `vX.Y.Z` (see [docs/releasing.md](docs/releasing.md)). The website deploys from `main`.
- **Report format:** if you change what the report looks like, change it in both apps and in
  [docs/report-format.md](docs/report-format.md).
