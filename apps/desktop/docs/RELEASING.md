# Releasing

The release procedure lives in [../../../RELEASING.md](../../../RELEASING.md): change the root `package.json` version
and add a matching section to the repository-root [CHANGELOG](../../../CHANGELOG.md) in a PR, merge to `main`, and
wait for the **Desktop release** workflow to create the tag and release (the CHANGELOG section is the release notes).

Packaging of each platform ZIP is done by `packaging/make_zip.py` (tested in `tests/test_packaging.py`).
