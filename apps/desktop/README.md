# CodeBridge

One tool for the AI-assisted coding loop:

**Export context → AI → diff → validate → apply → verify → undo**

It merges two earlier tools: **CodeDump** (export a project for an AI) and **dw.py** (apply an AI's diff safely).
Git does the applying (`git apply`); CodeBridge adds the workflow, validation, safety and recovery around it.
No AI API, no network: input and output are plain text, so it works with any model.

## Install

Pick one. Git must be on your PATH for patch features.

| Way | Python needed | Notes |
|---|---|---|
| Download a ZIP from **Releases** | no | `codebridge-windows-x64.zip`, `codebridge-linux-x64.zip`, `codebridge-macos-arm64.zip` (binary + launcher + README) |
| `pipx install .` (from this folder) | 3.9+ | gives the `codebridge` command |
| Launchers `launchers/run.ps1`, `run.sh`, `run_macos.command` | no (if the binary sits next to them) | thin: they only start the binary |

macOS first run: `xattr -d com.apple.quarantine ./codebridge`.
Windows SmartScreen may warn about an unsigned binary: More info → Run anyway.

## Daily use

```text
codebridge                         # interactive menu (export on one screen, apply from the clipboard)
codebridge context export          # report of the current folder -> code_report_<name>.txt
codebridge context export --changed
# paste the report to the AI, copy its reply
codebridge patch apply             # reads diff.patch, or the clipboard (the menu always uses the clipboard); preview -> confirm -> apply
codebridge patch undo              # restore the files of the last run
```

In the menu: **1** opens one screen where you tick everything (`1 a t`, Enter = export), **2** applies the diff
you copied (Ctrl+C, then Enter; do not paste it into the terminal), **3** undoes. Details in [docs/USAGE.md](docs/USAGE.md).

If a diff cannot be applied, nothing is changed and `codebridge-fix.txt` is created (and copied to the
clipboard): the errors plus the current content of the affected files, ready to send back to the AI.

More: [docs/USAGE.md](docs/USAGE.md) · releasing: [docs/RELEASING.md](docs/RELEASING.md) · [CHANGELOG](../../CHANGELOG.md)

## Develop

```text
python -m unittest discover -s tests
PYTHONPATH=src python -m codebridge --version
```

Layout: `src/codebridge/{core,context,patch,ui}` · `tests/` · `launchers/` · `packaging/` · `.github/workflows/`.

License: MIT.
