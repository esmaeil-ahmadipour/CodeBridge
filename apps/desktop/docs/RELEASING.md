# Releasing

1. Update `__version__` in `src/codebridge/__init__.py` and `version` in `pyproject.toml`; add a CHANGELOG entry.
2. Run the tests: `python -m unittest discover -s tests`.
3. Tag and push:
   ```text
   git tag v1.0.0
   git push origin main --tags
   ```
4. The **Release** workflow (`.github/workflows/release.yml`) then:
   - runs the tests,
   - builds a single-file binary with PyInstaller on Windows, Linux (Ubuntu 22.04) and macOS (Apple Silicon),
   - smoke-tests each binary with `--version`,
   - builds the sdist/wheel, adds the launchers and `SHA256SUMS.txt`,
   - publishes everything as a GitHub Release.

You can also run it by hand: Actions → Release → Run workflow (it uploads artifacts but does not publish a release).

Notes: binaries are unsigned (Windows SmartScreen / macOS Gatekeeper may warn). For an Intel Mac build, add
`{ os: macos-13, asset: codebridge-macos-x64, bin: codebridge }` to the build matrix if that runner is available.
