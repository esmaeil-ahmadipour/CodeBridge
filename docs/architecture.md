# Architecture

```text
apps/web      Next.js (App Router), React, Tailwind v4, en/fa/ar, PWA. Hosted on Vercel.
apps/desktop  Python 3.9+, uses git. CLI + menu. Binaries via PyInstaller (GitHub Actions).
docs          cross-cutting documents
```

## Boundaries
- **No shared code.** The two apps use different languages. What they share is a *contract*:
  the report format ([report-format.md](report-format.md)) and the privacy promise ([privacy.md](privacy.md)).
- **Each app is self-contained**: own dependencies, lockfile, tests, README, changelog.
- **No monorepo tooling** (Turborepo, Nx, workspaces). Nothing needs to be built across apps.
  Add `packages/` only if real shared code appears.

## What each app does
| | web | desktop |
|---|---|---|
| Export project to text | yes, from a ZIP, in the browser | yes, from a folder |
| `.gitignore` | rules parsed in JS | `git ls-files` (fallback parser) |
| Apply an AI diff | not yet | yes (`git apply`, atomic, undo) |
| Split report | by size (KB/MB), byte-accurate | by token estimate |
| Needs git / Python | no / no | yes (git) / no (binary) |

## Deploy and release
- Web: push to `main`; Vercel (Root Directory `apps/web`) deploys. `vercel.json` skips builds when `apps/web` did not change.
- Desktop: tag `desktop-vX.Y.Z`; the release workflow builds and publishes the binaries. The website's download buttons use
  `releases/latest/download/<asset>`, so the website never needs its own GitHub release.
