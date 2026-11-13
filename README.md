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
apps/web/        Next.js site (pnpm workspace package; deployed on Vercel, Root Directory = apps/web)
apps/desktop/    Python tool (binaries and releases are built from the root package.json version)
tests/           shared version and changelog metadata tests
docs/            architecture, privacy promise, report format, releasing
.github/         path-filtered app CI plus a reusable metadata-check workflow
```
The repository root owns the pnpm workspace and the single `pnpm-lock.yaml`; its `package.json` is the authoritative
application version for both apps, and the root `CHANGELOG.md` holds release notes. Shared version/changelog checks live in `tests/`;
desktop-specific tests remain in `apps/desktop/tests/`. See [RELEASING.md](RELEASING.md) for the local check command and
how the reusable metadata workflow participates in CI and releases. The Python desktop app is not a pnpm package.
Start with the README inside the app you work on.

## Quick start
```text
# website (install once at the repository root)
pnpm install
pnpm dev

# equivalent commands from apps/web
cd apps/web && pnpm dev

# desktop tool
cd apps/desktop && PYTHONPATH=src python -m codebridge
```

More: [docs/architecture.md](docs/architecture.md) · [docs/privacy.md](docs/privacy.md) · [docs/releasing.md](docs/releasing.md) · [CONTRIBUTING.md](CONTRIBUTING.md)

License: MIT.