# Changelog

## 3.1.2
Web UX polish and guide page fixes.

- **Navbar:** the hamburger menu button now comes first, before the logo (RTL-aware).
- **Hero:** the "Try it in your phone or desktop browser" button now scrolls to the web tool ("Only need an export?") instead of the mobile showcase.
- **Web tool result:** after conversion, the ZIP name and file count fly in from the progress check mark into the result card (hero animation), with a green check on the name and a green file count; respects `prefers-reduced-motion`.
- **Copy button:** shows a loading spinner while the text is being written to the clipboard, then a green check that disappears after 2 seconds.
- **Convert / Convert again:** restyled as real buttons with accent fill (Convert) or accent outline (Convert again), hover lift and shadow, focus ring and a clear disabled state.
- **Guide:** added "Back to home" buttons at the top and bottom of the page.
- **Guide:** the version in the eyebrow is no longer hardcoded; it is injected from the root `package.json` like the footer (all locales).

## 3.1.1
Desktop export parity with the web tool, plus minor web UX fixes.

- **Desktop configuration wizard:** interactive 5-step flow (project type, languages, SVG files, lock files, test files) before export, with back/next/cancel navigation and a confirmation summary.
- **Project-type-aware filtering:** SVG, lock files (`pubspec.lock`, `package-lock.json`, `poetry.lock`, `Cargo.lock`, etc.) and test files (`*_test.*`, `test_*.py`, `conftest.py`, `__tests__/`, etc.) are excluded per project type (Flutter, React, Next.js, Node.js, Python, Rust, Other) when the user opts in.
- **Mandatory secret redaction:** API keys, AWS/GitHub tokens, passwords, private keys, DB credentials and `.env`/`.npmrc`/`.pypirc` contents are automatically redacted before token estimation, splitting and export. Redaction cannot be disabled by any configuration; failure aborts the export (fail-closed).
- **ExportConfig model:** strongly typed dataclass in `core/config.py` distinguishing unanswered (`None`) from explicit `True`/`False`, with validation, JSON serialization and legacy settings migration (`redact_secrets` forced to `True`).
- **Web UX:** reduced top whitespace on the "How it works" section; Help section title (`کمک می‌خواهید؟`) now matches other section titles (22px `h2` instead of oversized `big`).
- **Tests:** 27 new desktop tests (config validation, scanner filters) added; all 58 desktop tests pass. Web tests have 4 pre-existing failures unrelated to this branch.

## 3.1.0
Desktop export parity with the web tool, plus web UX and accessibility improvements.

- **Desktop configuration wizard:** interactive 5-step flow (project type, languages, SVG, lock files, test files) before export, with back/next/cancel navigation and a confirmation summary.
- **Project-type-aware filtering:** SVG, lock files (`pubspec.lock`, `package-lock.json`, `poetry.lock`, `Cargo.lock`, etc.) and test files (`*_test.*`, `test_*.py`, `conftest.py`, `__tests__/`, etc.) are excluded per project type (Flutter, React, Next.js, Node.js, Python, Rust, Other) when the user opts in.
- **Mandatory secret redaction:** API keys, AWS/GitHub tokens, passwords, private keys, DB credentials and `.env`/`.npmrc`/`.pypirc` contents are automatically redacted before token estimation, splitting and export. Redaction cannot be disabled by any configuration; failure aborts the export (fail-closed).
- **ExportConfig model:** strongly typed dataclass in `core/config.py` distinguishing unanswered (`None`) from explicit `True`/`False`, with validation, JSON serialization and legacy settings migration (`redact_secrets` forced to `True`).
- **Web UX:** reduced top whitespace on the "How it works" section; Help section title (`کمک می‌خواهید؟`) now matches other section titles (22px `h2` instead of oversized `big`).
- **Download section:** removed the browser-version CTA, release version/date/checksum row, and detected-OS message; the recommended platform remains highlighted.
- **Web accessibility:** footer redesign with improved RTL support, Navbar and layout adjustments across all locales (en, fa, ar).
- **Release:** version synchronized across web root `package.json` and desktop; CI release metadata checks gating the desktop release workflow.
- Tests: 27 new desktop tests (config validation, scanner filters) added; all 58 desktop tests pass. All 35 web tests pass.

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
