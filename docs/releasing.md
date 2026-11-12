# Releasing

For the desktop release steps, version/tag rules and CHANGELOG requirement, see [RELEASING.md](../RELEASING.md).

## Website
Merge to `main`. Vercel builds `apps/web` and deploys to https://codebridge.tarvix.org.
Optional switch: `NEXT_PUBLIC_ENABLE_DOWNLOADS=true` (Vercel -> Environment Variables) shows the desktop downloads and
PWA install section; turn it on after the first desktop release exists, then redeploy once.

## Desktop assets
The `Desktop release` workflow:
- runs the desktop tests,
- builds a single-file PyInstaller binary on Windows x64, Linux x64 (Ubuntu 22.04) and macOS ARM64 (isolated matrix jobs),
- smoke-tests each binary (`--version`), packages it into a ZIP, and re-runs `--version` from the extracted ZIP,
- only if all three builds succeeded: builds the sdist/wheel, writes `SHA256SUMS.txt` and verifies it, and publishes a
  stable GitHub Release (notes taken from the matching `CHANGELOG.md` section) with these assets:

| Asset | Contents |
|---|---|
| `codebridge-windows-x64.zip` | `codebridge.exe`, `run.ps1`, `README.txt`, `LICENSE` |
| `codebridge-linux-x64.zip` | `codebridge`, `run.sh`, `README.txt`, `LICENSE` |
| `codebridge-macos-arm64.zip` | `codebridge`, `run.sh`, `run_macos.command`, `README.txt`, `LICENSE` |
| sdist + wheel | Python packages |
| `SHA256SUMS.txt` | checksums of all of the above |

The Download section links to `https://github.com/esmaeil-ahmadipour/codebridge/releases/latest/download/<asset>`.
GitHub redirects that URL to the newest stable release, so the same links serve each new version without a website
redeploy. Asset names are the contract: renaming one means updating `apps/web/src/lib/site.ts`.

Binaries are unsigned (Windows SmartScreen / macOS Gatekeeper may warn). Intel macOS is not built or supported.