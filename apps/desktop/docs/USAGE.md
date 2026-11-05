# Usage

## Commands

```text
codebridge                                  interactive menu
codebridge context export [PATH]            write the report
codebridge context preview [PATH]           list what would be exported (writes nothing)
    -p NAME | --all                         registered project(s)
    --changed | --since REF | --files F...  only some files
    -o FILE  --clipboard  --compact  --no-backup
codebridge patch check   [FILE|-]           can this diff be applied?
codebridge patch preview [FILE|-] [--diff]  file list with +/- counts
codebridge patch apply   [FILE|-]           apply (asks first)
    -y  --partial  -b BRANCH  -c "message"  --no-archive  --no-fix  -r REPO
codebridge patch undo [RUN_ID] [--force] [-r REPO]
codebridge project list | add PATH [-n NAME] [--preset flutter|node|python|all] | remove NAME
codebridge history [-n N]
codebridge settings show | path | reset
```

The diff source for `patch` is: the file you name, `-` (stdin), `diff.patch` / `changes.patch` / `diff.txt`
in the current folder, or the clipboard (in that order). The repo is the current folder unless `-r` is given.

Exit codes: `0` ok · `1` usage/environment error · `2` diff could not be applied · `3` undo refused/failed.

## What happens on `patch apply`

1. The AI reply is cleaned: prose around the diff, ```` ```diff ```` fences, CRLF, a BOM and blank context
   lines whose leading space was stripped are all tolerated.
2. The whole diff is checked at once. If plain `git apply` rejects it, tolerant modes are tried in order
   (`--recount`, ignore whitespace, reduced context) and the mode used is shown.
3. Strict mode (default) is all-or-nothing: if any file fails, nothing is changed. `--partial` applies the rest.
4. Before touching files, each file is snapshotted under `.git/codebridge/runs/<id>/` (invisible to git).
5. After success only: `-b` creates the branch, `-c` commits **only the patch's files**. `-c` is refused up
   front if those files already had uncommitted changes, so your earlier work is never swept into the commit.
6. `undo` restores the snapshots exactly. If a file changed after the run, undo refuses (use `--force`).

## Settings

`settings.json` is looked up as: `--config` → `$CODEBRIDGE_CONFIG` → `./settings.json` → the user config
folder (`%APPDATA%\codebridge`, `~/Library/Application Support/codebridge`, `~/.config/codebridge`).
Missing, empty or broken files are restored to defaults (a broken one is saved as `.bak`).
CodeDump v1/v2 settings load unchanged and are upgraded to version 3.

```json
{
  "version": 3,
  "defaults": { "only_extensions": [], "use_gitignore": true, "split_tokens": 0,
                "prompt_header": true, "redact_secrets": true, "anonymize_paths": true, "...": "..." },
  "patch":    { "strict": true, "confirm_before_apply": true, "auto_commit": false,
                "create_branch": false, "archive_applied": true },
  "projects": [ { "name": "app", "path": "/path/app", "active": true, "overrides": {} } ]
}
```

All options can also be changed from the menu: Settings. Reports are written to the folder you run
CodeBridge from (`output_dir` is relative to it).

## Tips

- Keep the AI instruction header on (`prompt_header`): it asks for one fenced unified diff, which applies most reliably.
- Use `--changed` to send only what you are working on; it saves many tokens.
- Secrets matching common patterns are redacted in reports, but always glance at a report before sharing it.
