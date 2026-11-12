# Usage

## Interactive menu

Run `codebridge` with no arguments. Type a number and press Enter.

```text
┌─ CodeBridge 3.0.0 ────────────────────────┐
│  1  Export project for the AI             │
│  2  Apply the AI's diff                   │
│  3  Undo last applied diff                │
│  4  Projects                              │
│  5  Settings                              │
│  6  History                               │
│  0  Exit                                  │
└───────────────────────────────────────────┘
```

**1 Export** shows one screen. Type keys (several at once, e.g. `1 a t`) and press Enter; Enter alone exports
what you see. The "Will export: ..." line above the box always shows the current choice.

| Key | Meaning |
|---|---|
| `1`-`6` | project type (one); changing it resets the languages to that type's defaults |
| `a`-`j` | languages on/off (dart, javascript, typescript, python, go, rust, java, kotlin, swift, c#) |
| `x` | add custom languages |
| `s` `l` `t` `o` | include SVG contents · exclude lock files · exclude tests · only changed files |
| `p` | choose another project (repo list) |
| `q` | cancel |

Secret redaction is always on. The type is detected from the folder (`pubspec.yaml`, `next.config.*`,
`package.json`, `pyproject.toml`); other choices start from your last export.

**2 Apply** and **3 Undo** first ask for the repo: saved projects are listed one per line with their folder
(the last used one first). Enter picks the first; you can also type a number, a name or a folder path.
For Apply, copy the AI's diff (Ctrl+C) and press Enter. **Do not paste it into the terminal**: a multi-line
paste is cut at the first line. The diff is read from the clipboard; to apply a file use the CLI (below).

## Commands

```text
codebridge                                  interactive menu (see above)
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

The diff source for `codebridge patch` is: the file you name, `-` (stdin), `diff.patch` / `changes.patch` / `diff.txt`
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

`export` and `last_project` are written by the menu (the last export choices and the last repo used) and are
the defaults of the next export screen. `settings.json` is looked up as: `--config` → `$CODEBRIDGE_CONFIG` → `./settings.json` → the user config
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
  "projects": [ { "name": "app", "path": "/path/app", "active": true, "overrides": {} } ],
  "export":  { "project_type": "flutter", "languages": ["dart"], "include_svg": false,
                "exclude_lock_files": true, "exclude_test_files": true },
  "last_project": "app"
}
```

All options can also be changed from the menu: Settings. Reports are written to the folder you run
CodeBridge from (`output_dir` is relative to it).

## Tips

- Keep the AI instruction header on (`prompt_header`): it asks for one fenced unified diff, which applies most reliably.
- Use `--changed` to send only what you are working on; it saves many tokens.
- Secrets matching common patterns are redacted in reports, but always glance at a report before sharing it.
