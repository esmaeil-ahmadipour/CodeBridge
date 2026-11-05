# Releasing

## Website
Merge to `main`. Vercel builds `apps/web` and deploys to https://codebridge.tarvix.org.
Optional switch: `NEXT_PUBLIC_ENABLE_DOWNLOADS=true` (Vercel -> Environment Variables) shows the desktop downloads and
PWA install section; turn it on after the first desktop release exists, then redeploy.

## Desktop
1. Bump `__version__` in `apps/desktop/src/codebridge/__init__.py` and `version` in `apps/desktop/pyproject.toml`; update `apps/desktop/CHANGELOG.md`.
2. `cd apps/desktop && python -m unittest discover -s tests`
3. Tag and push:
   ```text
   git tag desktop-v1.0.0
   git push origin main --tags
   ```
4. The **Desktop release** workflow tests, builds binaries (Windows, Linux, macOS), smoke-tests them, and publishes a GitHub
   Release with `SHA256SUMS.txt`, the launchers and the sdist/wheel.

Binaries are unsigned (Windows SmartScreen / macOS Gatekeeper may warn).
