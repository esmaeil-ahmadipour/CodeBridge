"""Find the files to export. Uses `git ls-files` when possible (exact .gitignore semantics)."""
from __future__ import annotations
import fnmatch, os
from pathlib import Path
from typing import Optional
from ..core.config import ExportConfig, LOCK_FILES_BY_PROJECT, TEST_RULES_BY_PROJECT
from ..core.git import git, repo_root

ALLOWED_HIDDEN = {".gitignore", ".gitattributes", ".gitkeep"}


def skip_path(rel: str, o: dict, is_dir: bool = False) -> bool:
    parts = rel.split("/")
    dirs = parts if is_dir else parts[:-1]
    for i, d in enumerate(dirs):
        sub = "/".join(parts[:i + 1])
        if any(fnmatch.fnmatch(d, p) or fnmatch.fnmatch(sub, p) for p in o["skip_folders"]):
            return True
    if not is_dir and any(fnmatch.fnmatch(parts[-1], p) for p in o["skip_files"]):
        return True
    low = rel.lower()
    if any(p.lower() in low for p in o["skip_if_contains"]):
        return True
    if not o["include_hidden"]:
        if any(p.startswith(".") and p not in ALLOWED_HIDDEN for p in parts):
            return True
    return False


def _matches_any(name: str, patterns: list[str]) -> bool:
    low = name.lower()
    return any(p.lower() in low for p in patterns)


def _is_test_file(rel: str, project_type: str) -> bool:
    rules = TEST_RULES_BY_PROJECT.get(project_type)
    if not rules:
        return False
    parts = rel.split("/")
    dirs = parts[:-1]
    name = parts[-1].lower()
    if any(d.lower() in (d2.lower() for d2 in rules["dirs"]) for d in dirs):
        return True
    return _matches_any(name, rules["files"])


def _is_lock_file(rel: str, project_type: str) -> bool:
    rules = LOCK_FILES_BY_PROJECT.get(project_type)
    if not rules:
        return False
    name = (rel.split("/")[-1] or "").lower()
    return any(name == l.lower() for l in rules)


def apply_project_filters(paths: list[str], cfg: ExportConfig) -> list[str]:
    """Remove SVG / lock / test files according to user export choices.

    Only applies when the corresponding `exclude_*` flag is explicitly True.
    `None` (unanswered) means no filtering for that category.
    Project type "other" has no default lock/test rules.
    """
    out: list[str] = []
    for p in paths:
        name = p.split("/")[-1].lower()
        if cfg.include_svg is False and name.endswith(".svg"):
            continue
        if cfg.exclude_lock_files is True and _is_lock_file(p, cfg.project_type or ""):
            continue
        if cfg.exclude_test_files is True and _is_test_file(p, cfg.project_type or ""):
            continue
        out.append(p)
    return out


# ---- fallback .gitignore parser (used only outside git repos) ----
def gitignore_rules(root) -> list:
    f = Path(root) / ".gitignore"
    rules = []
    if f.is_file():
        for ln in f.read_text(encoding="utf-8", errors="ignore").splitlines():
            ln = ln.strip()
            if ln and not ln.startswith(("#", "!")):
                rules.append(ln)
    return rules


def git_ignored(rel: str, is_dir: bool, rules: list) -> bool:
    name = rel.rsplit("/", 1)[-1]
    for r in rules:
        if r.endswith("/") and not is_dir:
            continue
        r = r.strip("/")
        if fnmatch.fnmatch(name, r) or fnmatch.fnmatch(rel, r) or rel.startswith(r + "/"):
            return True
    return False


def read_text(path):
    """Return text, or None for binary files."""
    with open(path, "rb") as f:
        data = f.read()
    bom16 = data.startswith((b"\xff\xfe", b"\xfe\xff"))
    if b"\x00" in data[:8192] and not bom16:
        return None
    if bom16:
        return data.decode("utf-16", errors="replace")
    for enc in ("utf-8-sig", "cp1256"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            pass
    return data.decode("utf-8", errors="replace")


def _in_git(root) -> bool:
    return repo_root(root) is not None


def _split_z(out: str) -> list:
    return [p for p in out.split("\0") if p]


def changed_files(root, since=None) -> list:
    """Files modified in the working tree (or since a ref) + untracked, relative to root."""
    names = []
    if since:
        r = git(root, "diff", "--name-only", "--relative", "-z", since, "--")
    else:
        r = git(root, "diff", "--name-only", "--relative", "-z", "HEAD", "--")
    if r.returncode == 0:
        names += _split_z(r.stdout)
    elif since:
        raise ValueError(f"cannot diff against '{since}'")
    u = git(root, "ls-files", "-z", "--others", "--exclude-standard")
    if u.returncode == 0:
        names += _split_z(u.stdout)
    return sorted(set(n.replace("\\", "/") for n in names))


def _candidates(root, o) -> list:
    if o["use_gitignore"] and _in_git(root):
        r = git(root, "ls-files", "-z", "--cached", "--others", "--exclude-standard")
        if r.returncode == 0:
            return sorted(set(p.replace("\\", "/") for p in _split_z(r.stdout)))
    rules = gitignore_rules(root) if o["use_gitignore"] else []
    found = []
    for cur, dirs, files in os.walk(root):
        rel_dir = os.path.relpath(cur, root).replace("\\", "/")
        rel_dir = "" if rel_dir == "." else rel_dir
        keep = []
        for d in sorted(dirs):
            rel = (rel_dir + "/" + d).lstrip("/")
            if not skip_path(rel, o, True) and not (rules and git_ignored(rel, True, rules)):
                keep.append(d)
        dirs[:] = keep
        for fn in sorted(files):
            rel = (rel_dir + "/" + fn).lstrip("/")
            if not (rules and git_ignored(rel, False, rules)):
                found.append(rel)
    return found


def collect(root, o, skip_abs=(), only=None, export_cfg: Optional[ExportConfig] = None) -> list:
    """-> list of (rel, size, text). `only` = explicit list of relative paths."""
    root = os.path.abspath(root)
    exts = [e.lower() for e in o["only_extensions"]]
    limit = o["max_file_mb"] * 1024 * 1024 if o["max_file_mb"] else 0
    cands = sorted(set(only)) if only is not None else _candidates(root, o)
    # Project-type filtering (SVG / lock / test) runs after path filtering,
    # before content reading. `only` (explicit files) is intentionally not
    # filtered here so callers can force specific files.
    if export_cfg is not None and only is None:
        cands = apply_project_filters(cands, export_cfg)
    found = []
    for rel in cands:
        full = os.path.join(root, rel)
        if os.path.abspath(full) in skip_abs or not os.path.isfile(full):
            continue
        if only is None and skip_path(rel, o):
            continue
        if exts and os.path.splitext(rel)[1].lower() not in exts:
            continue
        try:
            size = os.path.getsize(full)
            if limit and size > limit:
                continue
            text = read_text(full)
        except OSError:
            continue
        if text is not None:
            found.append((rel, size, text))
    if o["sort_by"] == "size":
        found.sort(key=lambda x: -x[1])
    return found
