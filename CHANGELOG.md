# Changelog

## 3.0.1
Improved release version and changelog consistency.

- Release builds verify the generated desktop version matches the root `package.json` before packaging binaries.
- Moved the changelog to the repository root and require exactly one non-empty section for the current version.
- Release notes use the matching changelog section; missing or duplicate sections block release builds.
- Shared version and changelog checks live in root `tests/`; desktop-specific tests remain in `apps/desktop/tests/`.
- A reusable metadata workflow runs in desktop and web CI and gates the desktop release workflow.

## 3.0.0
Faster interactive menu. Exporting and applying now take one screen each instead of many questions.

- **Export on one screen:** project, type, languages and options (SVG, lock files, tests, changed only) are ticked
  with keys (`1 a t`, then Enter). A "Will export: ..." summary shows the result before you press Enter.
  Defaults come from the folder (type detection) and the last export.
- **Apply from the clipboard:** the menu no longer asks you to paste a diff into the terminal (multi-line paste
  does not work there). Copy the AI's diff, press Enter. `diff.patch` handling stays in the CLI only.
- **Repo picker** for Export, Apply and Undo: saved projects listed one per line with their folder, Enter = the last
  used one, or type a number, a name or a path. `settings.json` gains `last_project`.
- Main menu redrawn as a box, one item per line; no more "Press Enter to continue" after an export.
- Removed the 5-step export wizard (`run_wizard`) and its next/back/confirm questions.
- Tests: the screen, repo picker and menu flows are covered; version consistency is checked.
- Settings file format is still version 3 (old files load unchanged).
- Release process: the GitHub release notes now come from this changelog (`scripts/changelog_section.py`), and a
  release fails if its version has no section here. Removed the temporary debug step from the release workflow.
- Tests: `test_changelog.py` checks the current version has a section, newest first, no duplicates.
- Docs: `RELEASING.md` explains version vs tag and the workflow checks.

## 2.2.1
Align desktop package metadata for the next stable release.

## 2.1.1
Fix the release metadata mismatch by aligning the package version with the new patch tag.

## 2.1.0
Automated stable release packages for Windows x64, Linux x64, and macOS ARM64.

## 1.0.0
First release. Merges CodeDump (context export) and dw.py (diff apply) into one tool.

- One CLI + interactive menu, one `settings.json`, one history.
- Context: `git ls-files` scanning, `--changed` / `--since` / `--files`, token estimate and split,
  AI instruction header, secret redaction, path anonymization, compact mode, backups, clipboard.
- Patch: cleans AI replies (prose, fences, CRLF, stripped blank lines), atomic apply,
  tolerant fallbacks (`--recount`, whitespace, reduced context), per-run snapshots, exact undo,
  branch/commit only after success and only for the patch's files, failure -> ready-to-send fix prompt.
- Settings: CodeDump v1/v2 files migrate automatically (v3 adds a `patch` section).
- Standalone binaries for Windows, Linux and macOS built by GitHub Actions.
