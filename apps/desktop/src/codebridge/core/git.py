from __future__ import annotations
import shutil
from pathlib import Path
from .util import run, CBError


def have_git() -> bool:
    return shutil.which("git") is not None


def git(root, *args, input_text=None):
    return run(["git", "-C", str(root), *args], input_text=input_text)


def repo_root(path):
    """Top-level of the git repo containing `path`, or None."""
    if not have_git():
        return None
    r = git(path, "rev-parse", "--show-toplevel")
    return str(Path(r.stdout.strip())) if r.returncode == 0 and r.stdout.strip() else None


def require_repo(path) -> str:
    if not have_git():
        raise CBError("git was not found on PATH; patch features need Git")
    root = repo_root(path)
    if not root:
        raise CBError(f"not a git repository: {path}")
    return root


def git_dir(root) -> str:
    r = git(root, "rev-parse", "--absolute-git-dir")
    if r.returncode != 0:
        raise CBError("cannot locate the .git directory")
    return r.stdout.strip()
