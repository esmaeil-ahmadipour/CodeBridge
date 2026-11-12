from __future__ import annotations
import argparse, os, shutil, sys, time
from pathlib import Path
from . import get_version
from .context.exporter import export_project
from .context.scanner import changed_files
from .core import history
from .core.config import (PRESETS, export_config_from_dict, load_settings, project_options,
                          save_settings)
from .core.git import repo_root, require_repo
from .core.paths import resolve_config
from .core.util import CBError, from_clipboard, setup_console, to_clipboard
from .patch import engine
from .patch.fix import build_fix_prompt
from .patch.parser import clean_diff

DEFAULT_DIFFS = ("diff.patch", "changes.patch", "diff.txt")


def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog="codebridge", description="AI-assisted code workflow: "
                                 "export context, apply AI diffs safely, undo.")
    ap.add_argument("-v", "--version", action="version", version=f"codebridge {get_version()}")
    ap.add_argument("--config", help="path to settings.json")
    sub = ap.add_subparsers(dest="cmd")

    c = sub.add_parser("context", help="export project files for an AI").add_subparsers(dest="sub")
    for name in ("export", "preview"):
        e = c.add_parser(name, help="write the report" if name == "export" else "list what would be exported")
        e.add_argument("target", nargs="?", help="project folder (default: current folder)")
        e.add_argument("-p", "--project", help="registered project name")
        e.add_argument("--all", action="store_true", help="every active registered project")
        e.add_argument("--changed", action="store_true", help="only modified/untracked files")
        e.add_argument("--since", metavar="REF", help="only files changed since a git ref")
        e.add_argument("--files", nargs="+", metavar="F", help="only these files")
        e.add_argument("-o", "--output", help="output file")
        e.add_argument("--clipboard", action="store_true", help="copy report to clipboard")
        e.add_argument("--no-backup", action="store_true")
        e.add_argument("--compact", action="store_true")

    p = sub.add_parser("patch", help="check / preview / apply / undo AI diffs").add_subparsers(dest="sub")
    for name in ("check", "preview", "apply"):
        a = p.add_parser(name)
        a.add_argument("source", nargs="?", help="diff file, '-' for stdin; default: diff.patch, else clipboard")
        a.add_argument("-r", "--repo", help="target repo (default: current folder)")
        a.add_argument("--clipboard", action="store_true", help="read the diff from the clipboard")
        if name == "preview":
            a.add_argument("--diff", action="store_true", help="also print the cleaned diff")
        if name == "apply":
            a.add_argument("-y", "--yes", action="store_true", help="skip the confirmation")
            a.add_argument("--partial", action="store_true", help="apply what can be applied")
            a.add_argument("-b", "--branch", help="create this branch after a successful apply")
            a.add_argument("-c", "--commit", metavar="MSG", help="commit only the applied files")
            a.add_argument("--no-archive", action="store_true")
            a.add_argument("--no-fix", action="store_true", help="do not write the fix prompt on failure")
    u = p.add_parser("undo", help="restore the files of the last (or given) run")
    u.add_argument("run", nargs="?", help="run id (default: last)")
    u.add_argument("-r", "--repo")
    u.add_argument("--force", action="store_true")

    pr = sub.add_parser("project", help="manage the project registry").add_subparsers(dest="sub")
    pr.add_parser("list")
    pa = pr.add_parser("add")
    pa.add_argument("path")
    pa.add_argument("-n", "--name")
    pa.add_argument("--preset", choices=sorted(PRESETS))
    prm = pr.add_parser("remove")
    prm.add_argument("name")

    h = sub.add_parser("history", help="recent exports and patch runs")
    h.add_argument("-n", type=int, default=20)
    s = sub.add_parser("settings", help="show / reset settings").add_subparsers(dest="sub")
    s.add_parser("show")
    s.add_parser("path")
    s.add_parser("reset")
    return ap


# ------------------------------------------------------------------ context
def cmd_context(a, cfg, s) -> int:
    dry = a.sub == "preview"
    targets = []
    if a.project:
        pj = next((x for x in s["projects"] if x["name"] == a.project), None)
        if not pj:
            raise CBError(f"no such project: {a.project}")
        targets = [(pj["name"], pj["path"], project_options(s, pj))]
    elif a.all:
        targets = [(x["name"], x["path"], project_options(s, x)) for x in s["projects"] if x.get("active", True)]
        if not targets:
            raise CBError("no active projects registered (codebridge project add PATH)")
    else:
        root = os.path.abspath(a.target or ".")
        pj = next((x for x in s["projects"] if os.path.abspath(x["path"]) == root), None)
        targets = [(pj["name"] if pj else Path(root).name or "project", root, project_options(s, pj))]
    total = 0
    export_cfg = None
    if s.get("export"):
        try:
            export_cfg = export_config_from_dict(s["export"])
        except Exception:
            export_cfg = None
    for name, root, o in targets:
        if a.compact:
            o["compact"] = True
        # Merge wizard export choices into scanner/exporter options.
        if export_cfg is not None:
            o["include_svg"] = export_cfg.include_svg
            o["exclude_lock_files"] = export_cfg.exclude_lock_files
            o["exclude_test_files"] = export_cfg.exclude_test_files
        only = None
        if a.files:
            only = [f.replace("\\", "/") for f in a.files]
        elif a.changed or a.since:
            if not repo_root(root):
                raise CBError("--changed/--since need a git repository")
            try:
                only = changed_files(root, a.since)
            except ValueError as e:
                raise CBError(str(e))
        r = export_project(name, root, o, outdir=os.getcwd(), output=a.output if len(targets) == 1 else None,
                           dry=dry, backup=not a.no_backup, only=only,
                           clipboard=True if a.clipboard else None,
                           export_cfg=export_cfg)
        if r:
            total += r["files"]
            if not dry:
                history.add(cfg, type="context", project=name, files=r["files"], outs=r["outs"])
    return 0 if total or dry else 1


# ------------------------------------------------------------------ patch
def _read_source(a):
    src = a.source
    if src == "-":
        return sys.stdin.buffer.read(), "stdin", None
    if src:
        pth = Path(src)
        if not pth.is_file():
            raise CBError(f"diff file not found: {src}")
        return pth.read_bytes(), str(pth), pth
    if not a.clipboard:
        for d in DEFAULT_DIFFS:
            if Path(d).is_file():
                return Path(d).read_bytes(), d, Path(d)
    clip = from_clipboard()
    if clip and clip.strip():
        return clip, "clipboard", None
    raise CBError("no diff given: pass a file, pipe to stdin ('-'), or copy the AI reply first")


def _show_plan(plan, preview=False) -> None:
    print(f"Repo  : {plan.root}")
    print(f"Files : {len(plan.patches)}")
    for fp in plan.patches:
        st = plan.per_file.get(fp.name, ("ok", ""))[0]
        tag = {"ok": "ok", "already": "already applied", "fail": "CANNOT APPLY"}[st]
        print(f"  [{fp.kind}] {fp.name}  (+{fp.added} -{fp.removed})  {tag}")
        if st == "fail" and plan.per_file[fp.name][1]:
            print("        " + plan.per_file[fp.name][1].replace("\n", "\n        "))
    if plan.status == "apply" and plan.flags:
        print(f"Note  : applies in tolerant mode ({' '.join(plan.flags)})")
    if plan.status == "fail" and plan.error and not any(s == "fail" for s, _ in plan.per_file.values()):
        print(f"Error : {plan.error}")


def cmd_patch(a, cfg, s) -> int:
    ps = s["patch"]
    if a.sub == "undo":
        root = require_repo(a.repo or ".")
        meta = engine.undo(root, a.run, a.force)
        print(f"Reverted run {meta['id']} ({len(meta['touched'])} file(s)) in {root}")
        history.add(cfg, type="undo", repo=root, run=meta["id"])
        return 0
    root = require_repo(a.repo or ".")
    raw, label, path = _read_source(a)
    text = clean_diff(raw)
    plan = engine.analyze(root, text)
    print(f"Source: {label}")
    _show_plan(plan)
    if a.sub == "preview" and a.diff:
        print("\n" + plan.text)
    if plan.status == "already":
        print("\nAlready applied: nothing to do.")
        return 0
    if a.sub in ("check", "preview"):
        print("\nOK: the diff can be applied." if plan.status == "apply" else "\nThe diff cannot be fully applied.")
        return 0 if plan.status == "apply" else 2
    # ---- apply
    partial = a.partial or not ps["strict"]
    dirty = git_status(root)
    if dirty:
        print("\nwarning: the repo has uncommitted changes (they stay untouched).")
    if plan.status == "fail" and not partial:
        _fail(plan, cfg, s, a, "strict mode: nothing was changed")
        return 2
    if ps["confirm_before_apply"] and not a.yes:
        if not sys.stdin.isatty():
            raise CBError("no terminal to confirm; re-run with -y")
        if input("\nApply these changes? [Y/n] ").strip().lower() not in ("", "y", "yes"):
            print("Cancelled. Nothing was changed.")
            return 0
    rid_hint = time.strftime("%Y%m%d-%H%M%S")
    branch = a.branch or (f"codebridge/{rid_hint}" if ps["create_branch"] else None)
    commit = a.commit or (f"Apply AI patch (codebridge {rid_hint})" if ps["auto_commit"] else None)
    try:
        meta = engine.apply_plan(plan, partial=partial, branch=branch, commit=commit, source=label)
    except CBError as e:
        if e.code == 2:
            _fail(plan, cfg, s, a, None)
        raise
    print(f"\nDone: {len(meta['files'])} applied, {len(meta['skipped'])} skipped. Run {meta['id']}")
    for n in meta["notes"]:
        print("warning:", n)
    if meta["branch"]:
        print(f"Branch: {meta['branch']}")
    if meta["commit"]:
        print(f"Committed: {meta['commit']}")
    print(f"Undo with: codebridge patch undo -r \"{root}\"")
    history.add(cfg, type="patch", repo=root, run=meta["id"], files=[f["name"] for f in meta["files"]])
    if path and ps["archive_applied"] and not a.no_archive and not meta["skipped"]:
        dst = path.with_name(f"{path.name}.applied-{time.strftime('%Y%m%d-%H%M%S')}")
        shutil.move(str(path), str(dst))
        print(f"Archived: {dst.name}")
    return 0


def git_status(root) -> str:
    from .core.git import git
    return git(root, "status", "--porcelain").stdout.strip()


def _fail(plan, cfg, s, a, headline) -> None:
    if headline:
        print(f"\n{headline}")
    if getattr(a, "no_fix", False):
        return
    prompt = build_fix_prompt(plan, s["defaults"])
    out = Path.cwd() / "codebridge-fix.txt"
    out.write_text(prompt, encoding="utf-8")
    clip = to_clipboard(prompt)
    print(f"Fix prompt for the AI written to {out.name}" + (" and copied to the clipboard." if clip else "."))
    print("Send it to the AI, then apply the new diff.")
    history.add(cfg, type="patch-failed", repo=plan.root, files=[fp.name for fp in plan.patches])


# ------------------------------------------------------------------ project / history / settings
def cmd_project(a, cfg, s) -> int:
    if a.sub == "list" or not a.sub:
        if not s["projects"]:
            print("No projects registered. Add one: codebridge project add PATH")
        for x in s["projects"]:
            print(f"  {x['name']}  {x['path']}" + ("" if x.get("active", True) else "  (inactive)"))
    elif a.sub == "add":
        path = os.path.abspath(a.path)
        if not os.path.isdir(path):
            raise CBError(f"folder not found: {path}")
        name = a.name or Path(path).name
        if any(x["name"] == name for x in s["projects"]):
            raise CBError(f"a project named '{name}' already exists")
        s["projects"].append({"name": name, "path": path, "active": True,
                              "overrides": dict(PRESETS[a.preset]) if a.preset else {}})
        save_settings(s, cfg)
        print(f"Added {name}")
    elif a.sub == "remove":
        n = len(s["projects"])
        s["projects"] = [x for x in s["projects"] if x["name"] != a.name]
        if len(s["projects"]) == n:
            raise CBError(f"no such project: {a.name}")
        save_settings(s, cfg)
        print(f"Removed {a.name}")
    return 0


def cmd_history(a, cfg, s) -> int:
    rows = history.read(cfg, a.n)
    if not rows:
        print("No history yet.")
    for r in rows:
        t = r.get("type", "?")
        detail = r.get("project") or r.get("repo") or ""
        extra = f" run={r['run']}" if r.get("run") else ""
        n = r.get("files")
        n = f" files={len(n) if isinstance(n, list) else n}" if n is not None else ""
        print(f"{r.get('time', '')}  {t:<13} {detail}{extra}{n}")
    return 0


def cmd_settings(a, cfg, s) -> int:
    import json
    if a.sub == "path":
        print(cfg)
    elif a.sub == "reset":
        from .core.config import default_settings
        if Path(cfg).is_file():
            shutil.copy(cfg, str(cfg) + ".bak")
        d = default_settings()
        d["projects"] = s["projects"]
        save_settings(d, cfg)
        print(f"Settings reset to defaults (old file saved as {Path(cfg).name}.bak, projects kept)")
    else:
        print(json.dumps(s, indent=2, ensure_ascii=False))
    return 0


def main(argv=None) -> int:
    setup_console()
    ap = build_parser()
    a = ap.parse_args(argv)
    try:
        cfg = resolve_config(a.config)
        if not a.cmd:
            if sys.stdin.isatty() and sys.stdout.isatty():
                from .ui.menu import run_menu
                return run_menu(cfg)
            ap.print_help()
            return 0
        s = load_settings(cfg)
        if a.cmd in ("context", "patch", "project", "settings") and not getattr(a, "sub", None):
            if a.cmd in ("project", "settings"):
                a.sub = "list" if a.cmd == "project" else "show"
            else:
                ap.parse_args([a.cmd, "-h"])
        fn = {"context": cmd_context, "patch": cmd_patch, "project": cmd_project,
              "history": cmd_history, "settings": cmd_settings}[a.cmd]
        return fn(a, cfg, s)
    except CBError as e:
        print(f"error: {e}", file=sys.stderr)
        return e.code
    except KeyboardInterrupt:
        print("\ncancelled", file=sys.stderr)
        return 130
