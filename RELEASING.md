# Releasing

1. In a pull request, change the root `package.json` `version` to a new `X.Y.Z` value and add a matching
   `## X.Y.Z` section at the top of `apps/desktop/CHANGELOG.md` (it becomes the release notes).
2. Merge the pull request to `main` and wait for the **Desktop release** workflow.
3. The workflow tests and builds all desktop platforms, then creates the matching `vX.Y.Z` tag and GitHub release.

Release runs are serialized; a queued run rechecks the remote tag before building.

If a workflow fails before publishing, no tag is created. Fix the issue and push again; the workflow retries the
current package version. Never reuse or delete a published tag.
