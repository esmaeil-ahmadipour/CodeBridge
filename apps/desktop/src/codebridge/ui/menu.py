"""Interactive menu. It only collects answers and calls the same commands as the CLI."""
from __future__ import annotations
from ..core.config import (export_config_from_dict, export_config_to_dict,
                           PATCH_SPEC, PRESETS,
                           SPEC, load_settings, save_settings)
from ..core.util import CBError
from .repo import pick_repo, resolve_repo
from .screen import run_screen, to_export_dict


def ask(msg, default=""):
    try:
        v = input(f"{msg}" + (f" [{default}]" if default else "") + ": ").strip()
    except EOFError:
        raise KeyboardInterrupt
    return v or default


def _call(cfg, *argv, pause: bool = True) -> None:
    from ..cli import main
    try:
        main(["--config", str(cfg), *argv])
    except SystemExit:
        pass
    if pause:
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


MENU = [("1", "Export project for the AI"), ("2", "Apply the AI's diff"), ("3", "Undo last applied diff"),
        ("4", "Projects"), ("5", "Settings"), ("6", "History"), ("0", "Exit")]


def _menu_box(version: str) -> str:
    w = 42
    head = f"─ CodeBridge {version} "
    rows = ["│" + f"  {k}  {t}".ljust(w) + "│" for k, t in MENU]
    return "\n".join(["┌" + head + "─" * (w - len(head)) + "┐", *rows, "└" + "─" * w + "┘"])


def _remember(cfg, target: str) -> None:
    s = load_settings(cfg, quiet=True)
    s["last_project"] = target
    save_settings(s, cfg)


def run_menu(cfg) -> int:
    from .. import get_version
    try:
        while True:
            print("\n" + _menu_box(get_version()))
            try:
                c = input("Type a number, then Enter > ").strip()
            except EOFError:
                return 0
            if c in ("0", "q"):
                return 0
            s = load_settings(cfg, quiet=True)
            if c == "1":
                st = run_screen(s.get("last_project") or ".", s.get("export"), s["projects"])
                if st is None:
                    continue
                target = st["project"]
                isname = any(p["name"] == target for p in s["projects"])
                s["export"] = export_config_to_dict(export_config_from_dict(to_export_dict(st)))
                s["last_project"] = target
                save_settings(s, cfg)
                argv = ["context", "export"] + (["-p", target] if isname else [target]) + (["--changed"] if st["o"] else [])
                _call(cfg, *argv, pause=False)
            elif c in ("2", "3"):
                target = pick_repo(s["projects"], s.get("last_project", ""))
                if target is None:
                    continue
                _remember(cfg, target)
                repo = resolve_repo(s["projects"], target)
                if c == "2":
                    print("\nCopy the AI's diff (Ctrl+C), then press Enter.")
                    print("Do NOT paste it here - it is read from your clipboard.")
                    input("Press Enter when copied (Ctrl+C to cancel) ")
                    _call(cfg, "patch", "apply", "--clipboard", "-r", repo)
                else:
                    _call(cfg, "patch", "undo", "-r", repo)
            elif c == "4":
                projects_menu(cfg)
            elif c == "5":
                settings_menu(cfg)
            elif c == "6":
                _call(cfg, "history")
    except KeyboardInterrupt:
        print()
        return 0
