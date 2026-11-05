# CodeBridge

Turn a project into one clean, AI-ready text file, apply the AI's diff safely, and undo it.
Private by design: nothing is uploaded.

| App | What it is | Where |
|---|---|---|
| **Website** | Landing page + an in-browser ZIP to TXT tool (PWA, en/fa/ar, light/dark) | [`apps/web`](apps/web) |
| **Desktop tool** | CLI/menu for Windows, macOS, Linux: export context, apply AI diffs, undo | [`apps/desktop`](apps/desktop) |

Site: https://codebridge.tarvix.org

## Repository layout
```text
apps/web/        Next.js site (deployed on Vercel, Root Directory = apps/web)
apps/desktop/    Python tool (binaries are built by GitHub Actions on tag desktop-v*)
docs/            architecture, privacy promise, report format, releasing
.github/         one workflow set per app (path-filtered)
```
Each app is self-contained (own lockfile, tests and README). Start with the README inside the app you work on.

## Quick start
```text
# website
cd apps/web && pnpm install && pnpm dev

# desktop tool
cd apps/desktop && PYTHONPATH=src python -m codebridge
```

More: [docs/architecture.md](docs/architecture.md) · [docs/privacy.md](docs/privacy.md) · [docs/releasing.md](docs/releasing.md) · [CONTRIBUTING.md](CONTRIBUTING.md)

License: MIT.
