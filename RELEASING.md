# Releasing

## Version and tag
- **Version** (`X.Y.Z`, SemVer) lives only in the root `package.json`. `scripts/sync_version.py` copies it into the
  desktop package (`_version.py`); local source runs show `X.Y.Z-dev+<sha>`, release binaries never do.
- **Tag** (`vX.Y.Z`) is created by the workflow, only after a successful release. Never create tags by hand and never
  reuse or delete a published tag.

## Steps
1. In a pull request, change the root `package.json` `version` to a new `X.Y.Z` value and add a matching
   `## X.Y.Z` section at the top of the root `CHANGELOG.md` (it becomes the release notes).
2. Merge the pull request to `main` and wait for the **Desktop release** workflow.
3. The workflow tests and builds all desktop platforms, then creates the matching `vX.Y.Z` tag and GitHub release
   with the CHANGELOG section as its notes.

## What the workflow checks
- The version is a plain `X.Y.Z`, and the run is on `main`.
- If tag `vX.Y.Z` already exists, the release is skipped. If the version is not greater than the latest tag, it fails.
- The root CHANGELOG has exactly one non-empty `## X.Y.Z` section, listed newest first
  (`tests/test_changelog.py`); the runtime version and setuptools version source are checked by
  `tests/test_release_metadata.py`.
- Each binary prints exactly `codebridge X.Y.Z`; the ZIPs and `SHA256SUMS.txt` are verified.

Run the shared metadata checks from the repository root:

```text
python scripts/sync_version.py
python -m unittest discover -s tests -v
```

Desktop-specific tests remain in `apps/desktop/tests/` and run with
`cd apps/desktop && python -m unittest discover -s tests -v`.
The reusable `.github/workflows/metadata-check.yml` runs the shared checks in desktop CI, web CI, and the release
workflow. Desktop and web CI run metadata checks as independent jobs; the release `version` job requires metadata
validation, and its test/build/package dependency chain prevents publishing after a failed check.

## Failures and fixes
Release runs are serialized; a queued run rechecks the remote tag before building.

If a workflow fails before publishing, no tag is created. Fix the issue and push again; the workflow retries the
current package version. To correct an already published release, publish a new higher version instead.
