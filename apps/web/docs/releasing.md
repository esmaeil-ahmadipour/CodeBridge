# Releasing

## Website
Merge to `main`. Vercel builds `apps/web` and deploys to https://codebridge.tarvix.org.
Optional switch: `NEXT_PUBLIC_ENABLE_DOWNLOADS=false` (Vercel -> Environment Variables) hides the desktop downloads and
PWA install section; they are shown by default. Redeploy after changing it.

## Desktop
1. **Prepare the version.** Bump `__version__` in `apps/desktop/src/codebridge/__init__.py` and `version` in
   `apps/desktop/pyproject.toml` (same number), and update `apps/desktop/CHANGELOG.md`.
2. **Test locally.** `cd apps/desktop && python -m unittest discover -s tests`
3. **Tag and push** a stable version tag `vMAJOR.MINOR.PATCH` (no prefix, no suffix):
   ```text
   git tag v1.2.3
   git push origin main --tags
   ```
   The tag must equal the package version (`v1.2.3` <-> `1.2.3`); the workflow fails otherwise. Other tags do not trigger it.
4. **The `Desktop release` workflow** (`.github/workflows/desktop-release.yml`) then:
   - runs the desktop tests and checks the tag against the package version,
   - builds a single-file PyInstaller binary on Windows x64, Linux x64 (Ubuntu 22.04) and macOS ARM64 (isolated matrix jobs),
   - smoke-tests each binary (`--version`), packages it into a ZIP, and re-runs `--version` from the extracted ZIP,
   - only if all three builds succeeded: builds the sdist/wheel, writes `SHA256SUMS.txt` and verifies it, and publishes a
     stable GitHub Release (generated notes) with these assets:

   | Asset | Contents |
   |---|---|
   | `codebridge-windows-x64.zip` | `codebridge.exe`, `run.ps1`, `README.txt`, `LICENSE` |
   | `codebridge-linux-x64.zip` | `codebridge`, `run.sh`, `README.txt`, `LICENSE` |
   | `codebridge-macos-arm64.zip` | `codebridge`, `run.sh`, `run_macos.command`, `README.txt`, `LICENSE` |
   | sdist + wheel | Python packages |
   | `SHA256SUMS.txt` | checksums of all of the above |

   A manual run (Actions -> Desktop release -> Run workflow) builds everything and uploads artifacts but never publishes.
   Re-running a tag's workflow replaces assets of the same name on that release.
5. **Website links need no change.** The Download section links to
   `https://github.com/esmaeil-ahmadipour/codebridge/releases/latest/download/<asset>`. GitHub redirects that URL to the
   newest stable release, so the same links serve each new version without a website redeploy. Asset names are the contract:
   renaming one means updating `apps/web/src/lib/site.ts`.

Binaries are unsigned (Windows SmartScreen / macOS Gatekeeper may warn). Intel macOS is not built or supported.
