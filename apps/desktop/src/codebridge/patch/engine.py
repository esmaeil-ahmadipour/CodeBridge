"""Analyze, apply (atomic) and undo AI diffs. Each run is recorded under .git/codebridge/runs/<id>/."""
from __future__ import annotations
import contextlib, hashlib, json, os, shutil, tempfile, time
from dataclasses import dataclass, field
from pathlib import Path
from ..core.git import git, git_dir
from ..core.util import CBError, run
from .parser import split_patches, detect_p

# Tried in order; the first that works is used (and reported).
MODES = [(), ("--recount",), ("--recount", "--ignore-whitespace"),
         ("--recount", "--ignore-whitespace", "-C1")]


@dataclass
class Plan:
    root: str
    text: str
    p: int
    patches: list
    status: str                      # apply | already | fail
    flags: tuple = ()
    per_file: dict = field(default_factory=dict)   # name -> (ok|already|fail, error)
    error: str = ""


@contextlib.contextmanager
def _patch_file(text):
    d = tempfile.mkdtemp(prefix="cb-")
    try:
        p = os.path.join(d, "p.diff")
        Path(p).write_bytes(text.encode("utf-8"))
        yield p
    finally:
        shutil.rmtree(d, ignore_errors=True)


def _apply(root, path, p, flags=(), check=False, reverse=False):
    cmd = ["git", "-C", str(root), "apply", f"-p{p}", "--whitespace=nowarn", *flags]
    if check:
        cmd.append("--check")
    if reverse:
        cmd.append("-R")
    cmd.append(path)
    r = run(cmd)
    return r.returncode == 0, (r.stderr or "").strip()


def _find_mode(root, path, p, reverse=False):
    err = ""
    for flags in MODES:
        ok, err = _apply(root, path, p, flags, check=True, reverse=reverse)
        if ok:
            return flags, ""
    return None, err


def analyze(root, text) -> Plan:
    patches = split_patches(text)
    if not patches:
        raise CBError("no per-file changes found in the diff")
    p = detect_p(text)
    with _patch_file(text) as f:
        flags, err = _find_mode(root, f, p)
        if flags is not None:
            return Plan(root, text, p, patches, "apply", flags,
                        {fp.name: ("ok", "") for fp in patches})
        rflags, _ = _find_mode(root, f, p, reverse=True)
        if rflags is not None:
            return Plan(root, text, p, patches, "already", rflags,
                        {fp.name: ("already", "") for fp in patches})
    per = {}
    for fp in patches:
        with _patch_file(fp.text) as f1:
            fl, e = _find_mode(root, f1, p)
            if fl is not None:
                per[fp.name] = ("ok", "")
            else:
                rf, _ = _find_mode(root, f1, p, reverse=True)
                per[fp.name] = ("already", "") if rf is not None else ("fail", e)
    return Plan(root, text, p, patches, "fail", (), per, err)


# ---------------------------------------------------------------- runs
def _hash(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None


def runs_dir(root) -> Path:
    return Path(git_dir(root)) / "codebridge" / "runs"


def list_runs(root) -> list:
    d = runs_dir(root)
    out = []
    if d.is_dir():
        for r in sorted(d.iterdir()):
            m = r / "meta.json"
            if m.is_file():
                out.append(json.loads(m.read_text(encoding="utf-8")))
    return out


def _new_id(base: Path) -> str:
    rid = time.strftime("%Y%m%d-%H%M%S")
    n, cand = 1, rid
    while (base / cand).exists():
        n += 1
        cand = f"{rid}-{n}"
    return cand


def _touched(patches) -> list:
    names = set()
    for fp in patches:
        for n in (fp.old, fp.new):
            if n:
                names.add(n)
    return sorted(names)


def preflight(root, patches, branch=None, commit=None) -> None:
    """Fail early (before touching files) on problems that would otherwise appear after."""
    if branch:
        if git(root, "check-ref-format", "--branch", branch).returncode != 0:
            raise CBError(f"invalid branch name: {branch}")
        if git(root, "rev-parse", "--verify", "-q", f"refs/heads/{branch}").returncode == 0:
            raise CBError(f"branch already exists: {branch}")
    if commit:
        dirty = git(root, "status", "--porcelain", "--", *_touched(patches)).stdout.strip()
        if dirty:
            raise CBError("these files already have uncommitted changes, so --commit would include "
                          "them too; commit/stash them first or run without --commit:\n"
                          + "\n".join("  " + l for l in dirty.splitlines()))


def apply_plan(plan: Plan, partial=False, branch=None, commit=None, source="") -> dict:
    root, patches = plan.root, plan.patches
    if plan.status == "fail":
        if not partial:
            raise CBError("nothing was changed: some files cannot be applied (strict mode)", 2)
        patches = [fp for fp in patches if plan.per_file.get(fp.name, ("fail",))[0] == "ok"]
        if not patches:
            raise CBError("nothing can be applied", 2)
    text = plan.text if patches is plan.patches else "".join(fp.text for fp in patches)
    preflight(root, patches, branch, commit)
    touched = _touched(patches)
    base = runs_dir(root)
    rid = _new_id(base)
    rdir = base / rid
    before = {}
    for n in touched:
        f = Path(root) / n
        before[n] = _hash(f)
        if f.is_file():
            dst = rdir / "before" / n
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, dst)
    rdir.mkdir(parents=True, exist_ok=True)
    with _patch_file(text) as pf:
        flags, err = _find_mode(root, pf, plan.p)
        if flags is None:
            shutil.rmtree(rdir, ignore_errors=True)
            raise CBError(f"nothing was changed: {err}", 2)
        ok, err = _apply(root, pf, plan.p, flags)
        if not ok:
            shutil.rmtree(rdir, ignore_errors=True)
            raise CBError(f"nothing was changed: {err}", 2)
    after = {n: _hash(Path(root) / n) for n in touched}
    meta = {"id": rid, "time": time.strftime("%Y-%m-%d %H:%M:%S"), "source": source,
            "flags": list(flags), "p": plan.p, "touched": touched, "before": before,
            "after": after, "files": [{"name": fp.name, "kind": fp.kind} for fp in patches],
            "skipped": [n for n, (s, _) in plan.per_file.items() if s != "ok"] if partial else [],
            "undone": None, "branch": None, "commit": None}
    (rdir / "patch.diff").write_text(text, encoding="utf-8")
    notes = []
    if branch:
        r = git(root, "checkout", "-b", branch)
        if r.returncode == 0:
            meta["branch"] = branch
        else:
            notes.append(f"could not create branch: {r.stderr.strip()}")
    if commit:
        git(root, "add", "-A", "--", *touched)
        r = git(root, "commit", "-q", "-m", commit)
        if r.returncode == 0:
            meta["commit"] = commit
        else:
            notes.append(f"commit failed: {(r.stderr or r.stdout).strip()}")
    (rdir / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    meta["notes"] = notes
    return meta


def undo(root, run_id=None, force=False) -> dict:
    runs = [r for r in list_runs(root) if not r["undone"]]
    if run_id:
        runs = [r for r in list_runs(root) if r["id"] == run_id]
        if not runs:
            raise CBError(f"no such run: {run_id}", 3)
        if runs[0]["undone"]:
            raise CBError(f"run {run_id} was already undone", 3)
    if not runs:
        raise CBError("nothing to undo (no recorded runs)", 3)
    meta = runs[-1]
    rdir = runs_dir(root) / meta["id"]
    changed = [n for n in meta["touched"] if _hash(Path(root) / n) != meta["after"][n]]
    if changed and not force:
        raise CBError("files changed since this run, nothing was reverted "
                      "(use --force to restore the pre-run versions anyway):\n"
                      + "\n".join("  " + n for n in changed), 3)
    for n in meta["touched"]:
        f = Path(root) / n
        snap = rdir / "before" / n
        if meta["before"][n] is None:
            if f.is_file():
                f.unlink()
            p = f.parent
            while p != Path(root) and p.is_dir() and not any(p.iterdir()):
                p.rmdir()
                p = p.parent
        else:
            f.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(snap, f)
    meta["undone"] = time.strftime("%Y-%m-%d %H:%M:%S")
    (rdir / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return meta
