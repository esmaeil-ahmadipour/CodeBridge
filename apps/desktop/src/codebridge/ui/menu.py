"""Interactive menu. It only collects answers and calls the same commands as the CLI."""
from __future__ import annotations
import copy
from pathlib import Path
from ..core.config import (PATCH_SPEC, PRESETS, SPEC, load_settings, save_settings)


def ask(msg, default=""):
    try:
        v = input(f"{msg}" + (f" [{default}]" if default else "") + ": ").strip()
    except EOFError:
        raise KeyboardInterrupt
    return v or default


def _call(cfg, *argv) -> None:
    from ..cli import main
    try:
        main(["--config", str(cfg), *argv])
    except SystemExit:
        pass
    input("\nPress Enter to continue...")


def _edit(spec, cur):
    label, typ, help_, choices = spec
    print(f"\n{label}" + (f"  ({help_})" if help_ else "") + f"\n  current: {cur}")
    if typ == "bool":
        return not cur
    if typ == "choice":
        v = ask(f"  one of {choices}", str(cur))
        return v if v in choices else cur
    if typ == "int":
        v = ask("  number", str(cur))
        return int(v) if v.lstrip("-").isdigit() else cur
    if typ == "list":
        v = ask("  space/comma separated (empty = clear, keep = unchanged)", "keep")
        if v == "keep":
            return cur
        return [x for x in v.replace(",", " ").split() if x]
    return ask("  value", str(cur))


def settings_menu(cfg) -> None:
    while True:
        s = load_settings(cfg, quiet=True)
        rows = [("defaults", k, v) for k, v in SPEC.items()] + [("patch", k, v) for k, v in PATCH_SPEC.items()]
        print("\n== Settings ==")
        for i, (sec, k, sp) in enumerate(rows, 1):
            print(f" {i:>2}. {sp[0]:<34} {s[sec][k]}")
        print("  r. Reset to defaults    0. Back")
        c = ask("Choose")
        if c == "0" or c == "":
            return
        if c == "r":
            _call(cfg, "settings", "reset")
            continue
        if c.isdigit() and 1 <= int(c) <= len(rows):
            sec, k, sp = rows[int(c) - 1]
            s[sec][k] = _edit(sp, s[sec][k])
            save_settings(s, cfg)


def projects_menu(cfg) -> None:
    while True:
        s = load_settings(cfg, quiet=True)
        print("\n== Projects ==")
        for i, p in enumerate(s["projects"], 1):
            print(f" {i}. {p['name']}  {p['path']}")
        print("  a. Add    d. Delete    0. Back")
        c = ask("Choose")
        if c in ("0", ""):
            return
        if c == "a":
            path = ask("Folder path")
            preset = ask(f"Preset {sorted(PRESETS)} (empty = none)")
            argv = ["project", "add", path] + (["--preset", preset] if preset in PRESETS else [])
            _call(cfg, *argv)
        elif c == "d":
            _call(cfg, "project", "remove", ask("Project name"))


def run_menu(cfg) -> int:
    from .. import __version__
    try:
        while True:
            print(f"\n=== CodeBridge {__version__} ===")
            print(" 1. Export project context for the AI")
            print(" 2. Apply the AI's diff (file or clipboard)")
            print(" 3. Undo the last applied diff")
            print(" 4. Projects")
            print(" 5. Settings")
            print(" 6. History")
            print(" 0. Exit")
            c = ask("Choose")
            if c in ("0", "q"):
                return 0
            if c == "1":
                t = ask("Project folder or registered name", ".")
                changed = ask("Only changed files? (y/N)", "n").lower().startswith("y")
                s = load_settings(cfg, quiet=True)
                isname = any(p["name"] == t for p in s["projects"])
                argv = ["context", "export"] + (["-p", t] if isname else [t]) + (["--changed"] if changed else [])
                _call(cfg, *argv)
            elif c == "2":
                src = ask("Diff file (empty = diff.patch or clipboard)")
                repo = ask("Target repo", ".")
                _call(cfg, "patch", "apply", *([src] if src else []), "-r", repo)
            elif c == "3":
                _call(cfg, "patch", "undo", "-r", ask("Target repo", "."))
            elif c == "4":
                projects_menu(cfg)
            elif c == "5":
                settings_menu(cfg)
            elif c == "6":
                _call(cfg, "history")
    except KeyboardInterrupt:
        print()
        return 0
