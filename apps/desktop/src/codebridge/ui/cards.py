"""Result cards for patch outcomes. Pure functions: data in, Result out."""
from __future__ import annotations

from pathlib import Path

from ..core.util import size_str
from .result import CANCEL, ERROR, OK, WARN, FileLine, Result

_NONE = "—"
_PLAN_TITLE = {"check": "PATCH CHECK", "preview": "PATCH PREVIEW", "apply": "APPLY PLAN"}


def _files(n: int) -> str:
    return f"{n} file" + ("" if n == 1 else "s")


def _project(root) -> str:
    return Path(str(root)).name or str(root)


def _dir(p):
    return str(p) if Path(str(p)).is_dir() else None


def _open_actions(items):
    """items: [(key, label, path)] -> (actions, open map); entries without a path are dropped."""
    items = [i for i in items if i[2]]
    if not items:
        return [], {}
    return [(k, lbl) for k, lbl, _ in items] + [("Enter", "Continue")], {k: p for k, _, p in items}


def apply_done(root, source, meta, flags=(), archived=None, extra_notes=()) -> Result:
    n = len(meta.get("files") or [])
    skipped = len(meta.get("skipped") or [])
    notes = list(meta.get("notes") or []) + list(extra_notes)
    if skipped:
        status, title = WARN, "APPLY PARTIAL"
        summary = f"{n} of {n + skipped} files applied · {skipped} skipped"
    elif flags or notes:
        status, title = WARN, "APPLY DONE · REVIEW"
        summary = f"{_files(n)} applied" + (" in tolerant mode · review the changes" if flags
                                            else " · review the notes")
    else:
        status, title = OK, "APPLY DONE"
        summary = f"{_files(n)} applied"
    rows = [("Repo", str(root)), ("Source", str(source)), ("Run", str(meta.get("id") or _NONE))]
    if flags:
        rows.append(("Mode", f"tolerant ({' '.join(flags)})"))
    if meta.get("branch"):
        rows.append(("Branch", str(meta["branch"])))
    if meta.get("commit"):
        rows.append(("Commit", str(meta["commit"])))
    if archived:
        rows.append(("Archived", archived))
    rows += [("Note", str(x)) for x in notes]
    actions, opens = _open_actions([("f", "Open folder", _dir(root))])
    return Result(status, title, _project(root), summary, rows=rows,
                  footer=[f'Undo: codebridge patch undo -r "{root}"'], actions=actions, open=opens)


def apply_failed(plan, source, *, strict=True, fix_file=None, fix_copied=False) -> Result:
    total = len(plan.patches)
    bad = sum(1 for st, _ in plan.per_file.values() if st == "fail")
    if strict:
        summary = "Nothing was changed" + (f" · {bad} of {total} files cannot be applied" if bad else "")
    else:
        summary = "Apply failed"
    rows = [("Repo", str(plan.root)), ("Source", str(source)), ("Run", _NONE)]
    if strict:
        rows.append(("Mode", "strict (all-or-nothing)"))
    if fix_file:
        rows.append(("Fix", fix_file + ("   (copied to clipboard)" if fix_copied else "")))
    footer = ["Send the fix prompt to your AI, then apply the new diff."] if fix_file else []
    actions, opens = _open_actions([
        ("x", "Open fix prompt", str(Path.cwd() / fix_file) if fix_file else None),
        ("f", "Open folder", _dir(plan.root))])
    return Result(ERROR, "APPLY FAILED", _project(plan.root), summary, rows=rows, footer=footer,
                  actions=actions, open=opens)


def apply_already(root, source) -> Result:
    return Result(CANCEL, "NOTHING TO DO", _project(root),
                  "This diff is already applied · no files changed",
                  rows=[("Repo", str(root)), ("Source", str(source)), ("Run", _NONE)])


def apply_cancelled(root, source, invalid=False) -> Result:
    summary = "Cancelled · nothing was changed"
    if invalid:
        summary = "Invalid choice · " + summary
    return Result(CANCEL, "APPLY CANCELLED", _project(root), summary,
                  rows=[("Repo", str(root)), ("Source", str(source)), ("Run", _NONE)])


def undo_done(root, meta) -> Result:
    n = len(meta.get("touched") or [])
    actions, opens = _open_actions([("f", "Open folder", _dir(root))])
    return Result(OK, "UNDO DONE", _project(root), f"Reverted {_files(n)}",
                  rows=[("Repo", str(root)), ("Run", str(meta.get("id") or _NONE))],
                  actions=actions, open=opens)


def patch_plan(plan, source, mode="check", partial=False) -> Result:
    """The analysis of a diff: what would happen to each file."""
    total = len(plan.patches)
    states = [plan.per_file.get(fp.name, ("ok", ""))[0] for fp in plan.patches]
    bad, already = states.count("fail"), states.count("already")
    flags = list(plan.flags or ())
    if plan.status == "already":
        status, summary = CANCEL, "Already applied · nothing to do"
    elif plan.status == "apply":
        status = WARN if flags else OK
        summary = f"{_files(total)} can be applied"
        if already:
            summary += f" · {already} already applied"
        if flags:
            summary += " · tolerant mode"
    else:
        status = WARN if (partial and mode == "apply") else ERROR
        summary = (f"{bad} of {total} {'file' if total == 1 else 'files'} cannot be applied"
                   if bad else "Cannot be applied")
        if bad and status == WARN:
            summary += " · they will be skipped"
    rows = [("Repo", str(plan.root)), ("Source", str(source))]
    if flags:
        rows.append(("Mode", f"tolerant ({' '.join(flags)})"))
    if plan.status == "fail" and not bad and plan.error:
        lines = str(plan.error).splitlines() or [""]
        rows.append(("Error", lines[0]))
        rows += [("", x) for x in lines[1:] if x.strip()]
    files = []
    for fp, st in zip(plan.patches, states):
        kind, stat = str(fp.kind or ""), f"+{fp.added} −{fp.removed}"
        if st == "fail":
            msg = plan.per_file[fp.name][1] or ""
            files.append(FileLine(ERROR, fp.name, kind, stat, "cannot apply",
                                  [x.rstrip() for x in msg.splitlines() if x.strip()]))
        elif st == "already":
            files.append(FileLine(CANCEL, fp.name, kind, stat, "already applied"))
        else:
            files.append(FileLine(OK, fp.name, kind, stat))
    return Result(status, _PLAN_TITLE.get(mode, "PATCH CHECK"), _project(plan.root), summary,
                  rows=rows, files=files)


def _out_rows(outs, sizes):
    rows = []
    for i, p in enumerate(outs):
        size = f"   ({size_str(sizes[i])})" if i < len(sizes) else ""
        rows.append(("File" if i == 0 else "", Path(p).name + size))
    rows.append(("Folder", str(Path(outs[0]).parent)))
    return rows


def export_done(name, root, r, show_tokens=True) -> Result:
    outs = r["outs"]
    bits = [_files(r["files"]), size_str(r.get("bytes", 0))]
    if show_tokens:
        bits.append(f"~{r.get('tokens', 0):,} tokens")
    if len(outs) > 1:
        bits.append(f"{len(outs)} parts")
    rows = _out_rows(outs, r.get("sizes") or [])
    clip = r.get("clipboard")
    if clip is not None:
        rows.append(("Clipboard", "copied" if clip else "unavailable"))
    status, title = (WARN, "EXPORT DONE · REVIEW") if clip is False else (OK, "EXPORT DONE")
    actions, opens = _open_actions([("o", "Open file", outs[0]), ("f", "Open folder", str(Path(outs[0]).parent))])
    return Result(status, title, name, " · ".join(bits), rows=rows, actions=actions, open=opens)


def export_preview(name, root, r) -> Result:
    files = [FileLine(OK, rel, "", size) for rel, size in r.get("list") or []]
    summary = (f"{_files(r['files'])} would be exported · {size_str(r.get('bytes', 0))}"
               " · nothing was written")
    return Result(CANCEL, "EXPORT PREVIEW", name, summary, rows=[("Folder", str(root))], files=files)


def export_empty(name, root) -> Result:
    actions, opens = _open_actions([("f", "Open folder", _dir(root))])
    return Result(WARN, "EXPORT EMPTY", name, "No files matched · no report was created",
                  rows=[("File", f"{_NONE} not created"), ("Folder", str(root)),
                        ("Hint", "check the filters and file types")], actions=actions, open=opens)


def export_failed(name, root, reason) -> Result:
    actions, opens = _open_actions([("f", "Open folder", _dir(root))])
    return Result(ERROR, "EXPORT FAILED", name, "No report was created",
                  rows=[("File", f"{_NONE} not created"), ("Folder", str(root)),
                        ("Reason", " ".join(str(reason).split()))], actions=actions, open=opens)


def export_summary(ok, total) -> Result:
    status = OK if ok == total else (WARN if ok else ERROR)
    return Result(status, "EXPORT SUMMARY", "", f"{ok} of {total} projects exported")
