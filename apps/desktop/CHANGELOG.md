# Changelog

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
