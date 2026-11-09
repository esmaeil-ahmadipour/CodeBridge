"""Interactive menu. It only collects answers and calls the same commands as the CLI."""
from __future__ import annotations
import copy
from pathlib import Path
from typing import Optional
from ..core.config import (ExportConfig, export_config_from_dict, export_config_to_dict,
                           validate_export_config, default_export_config, PATCH_SPEC, PRESETS,
                           SPEC, load_settings, save_settings)
from ..core.util import CBError


def ask(msg, default=""):
    try:
        v = input(f"{msg}" + (f" [{default}]" if default else "") + ": ").strip()
    except EOFError:
        raise KeyboardInterrupt
    return v or default


def ask_choice(msg: str, choices: list[str], allow_custom: bool = False) -> str:
    """Single-choice question. Returns the chosen value or custom text."""
    while True:
        print(f"\n{msg}")
        for i, c in enumerate(choices, 1):
            print(f"  {i}. {c}")
        if allow_custom:
            print("  c. Custom value")
        v = ask("Choose").strip()
        if v.isdigit():
            idx = int(v) - 1
            if 0 <= idx < len(choices):
                return choices[idx]
        if allow_custom and v == "c":
            return ask("Enter custom value").strip()
        if v in choices:
            return v
        print("  Invalid choice. Try again.")


def ask_yes_no(msg: str, default: str = "n") -> bool:
    """Yes/No question. Returns True for yes, False for no."""
    while True:
        v = ask(f"{msg} (y/N)", default).strip().lower()
        if v in ("y", "yes"):
            return True
        if v in ("n", "no", ""):
            return False
        print("  Please answer y or n.")


def ask_multiselect(msg: str, choices: list[str], allow_custom: bool = False) -> list[str]:
    """Multi-select question. Returns list of chosen values."""
    chosen: list[str] = []
    while True:
        print(f"\n{msg}")
        for i, c in enumerate(choices, 1):
            mark = " [x]" if c in chosen else " [ ]"
            print(f"  {i}. {c}{mark}")
        if allow_custom:
            print("  c. Add custom value")
        print("  d. Done")
        v = ask("Choose number, 'c' for custom, or 'd' to finish").strip().lower()
        if v == "d":
            if not chosen:
                print("  At least one selection is required.")
                continue
            return chosen
        if allow_custom and v == "c":
            custom = ask("Enter custom value").strip()
            if custom and custom not in chosen:
                chosen.append(custom)
            continue
        if v.isdigit():
            idx = int(v) - 1
            if 0 <= idx < len(choices):
                c = choices[idx]
                if c in chosen:
                    chosen.remove(c)
                else:
                    chosen.append(c)
                continue
        print("  Invalid choice. Try again.")


def _normalize_languages(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for x in items:
        k = x.strip().lower()
        if k and k not in seen:
            seen.add(k)
            out.append(k)
    return out


def run_wizard(cfg) -> Optional[ExportConfig]:
    """Interactive export configuration wizard.

    Returns an ExportConfig when the user confirms, or None if cancelled.
    Every question must be answered explicitly; None values mean unanswered.
    Supports back/next navigation between steps.
    """
    # Step definitions: (key, title, handler) where handler returns (value, back: bool)
    PROJECT_TYPES = ["flutter", "react", "nextjs", "node", "python", "other"]
    DEFAULT_LANGS = {
        "flutter": ["dart"],
        "react": ["javascript", "typescript"],
        "nextjs": ["javascript", "typescript"],
        "node": ["javascript", "typescript"],
        "python": ["python"],
        "other": [],
    }
    ALL_LANGS = ["dart", "javascript", "typescript", "python", "go", "rust", "java", "kotlin", "swift", "c#"]

    answers: dict = {
        "project_type": None,
        "custom_project_type": "",
        "languages": [],
        "custom_languages": [],
        "include_svg": None,
        "exclude_lock_files": None,
        "exclude_test_files": None,
    }
    step = 1
    total_steps = 5

    def step_project_type():
        while True:
            ptype = ask_choice(
                f"Step {step}/{total_steps} - Project type:",
                PROJECT_TYPES,
                allow_custom=True,
            )
            if ptype == "c":
                custom = ask("Enter custom project type name").strip()
                if not custom:
                    print("  Project type name cannot be empty.")
                    continue
                answers["project_type"] = "other"
                answers["custom_project_type"] = custom
            else:
                answers["project_type"] = ptype
                answers["custom_project_type"] = ""
            return answers, False

    def step_languages():
        defaults = DEFAULT_LANGS.get(answers["project_type"] or "other", [])
        while True:
            langs = ask_multiselect(
                f"Step {step}/{total_steps} - Programming languages (default: {', '.join(defaults) or 'none'}):",
                ALL_LANGS,
                allow_custom=True,
            )
            custom_extra = [l for l in langs if l not in ALL_LANGS]
            std_langs = [l for l in langs if l in ALL_LANGS]
            if not std_langs and not custom_extra:
                print("  At least one language is required.")
                continue
            answers["languages"] = _normalize_languages(std_langs)
            answers["custom_languages"] = _normalize_languages(custom_extra)
            return answers, False

    def step_svg():
        answers["include_svg"] = ask_yes_no(
            f"Step {step}/{total_steps} - Include SVG file contents in the text output?",
            default="n",
        )
        return answers, False

    def step_locks():
        answers["exclude_lock_files"] = ask_yes_no(
            f"Step {step}/{total_steps} - Exclude dependency lock files (e.g. package-lock.json, poetry.lock, pubspec.lock)?",
            default="y",
        )
        return answers, False

    def step_tests():
        answers["exclude_test_files"] = ask_yes_no(
            f"Step {step}/{total_steps} - Exclude test files and test directories?",
            default="y",
        )
        return answers, False

    STEP_HANDLERS = {
        1: step_project_type,
        2: step_languages,
        3: step_svg,
        4: step_locks,
        5: step_tests,
    }

    while 1 <= step <= total_steps:
        handler = STEP_HANDLERS[step]
        try:
            answers, _back = handler()
        except KeyboardInterrupt:
            print("\n  Cancelled.")
            return None
        # After a step completes, ask for next/back
        while True:
            nav = ask(f"Next (n) / Back (b) / Cancel (c) [n]:", "n").strip().lower()
            if nav in ("n", "next", ""):
                step += 1
                break
            if nav in ("b", "back"):
                if step > 1:
                    step -= 1
                    break
                else:
                    print("  Already at the first step.")
                    continue
            if nav in ("c", "cancel"):
                print("  Cancelled.")
                return None
            print("  Invalid choice. Use n, b, or c.")

    # ---- Summary & Confirmation ----
    while True:
        final_cfg = export_config_from_dict(answers)
        errors = validate_export_config(final_cfg)
        print("\n=== Configuration Summary ===")
        pt = final_cfg.project_type or "not set"
        print(f"  Project type : {pt}" + (f" ({final_cfg.custom_project_type})" if final_cfg.custom_project_type else ""))
        print(f"  Languages    : {', '.join(sorted(final_cfg.languages))}" + (f", {', '.join(sorted(final_cfg.custom_languages))}" if final_cfg.custom_languages else ""))
        print(f"  Include SVG  : {'Yes' if final_cfg.include_svg is True else 'No' if final_cfg.include_svg is False else 'Not answered'}")
        print(f"  Exclude locks: {'Yes' if final_cfg.exclude_lock_files is True else 'No' if final_cfg.exclude_lock_files is False else 'Not answered'}")
        print(f"  Exclude tests: {'Yes' if final_cfg.exclude_test_files is True else 'No' if final_cfg.exclude_test_files is False else 'Not answered'}")
        print(f"  Redact secrets: Yes (mandatory)")
        if errors:
            print("\n  Validation errors — fix before export:")
            for e in errors:
                print(f"    - {e}")
            v = ask("Return to wizard (w) or cancel (c)?", "w").strip().lower()
            if v in ("c", "cancel"):
                return None
            step = 1
            continue
        v = ask("\nConfirm export? (y)es / (n)o / e(dit step)", "y").strip().lower()
        if v in ("y", "yes", ""):
            return final_cfg
        if v in ("n", "no"):
            return None
        if v in ("e", "edit"):
            fnum = ask("Edit which step (1-5)?").strip()
            if fnum.isdigit() and 1 <= int(fnum) <= total_steps:
                step = int(fnum)
                break
            else:
                print("  Invalid step number.")
                continue


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
                wizard_cfg = run_wizard(cfg)
                if wizard_cfg is None:
                    input("\nExport cancelled. Press Enter to continue...")
                    continue
                # Persist wizard answers so the CLI can pick them up.
                s["export"] = export_config_to_dict(wizard_cfg)
                save_settings(s, cfg)
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
