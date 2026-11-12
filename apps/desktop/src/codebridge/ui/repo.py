"""Pick a repo: saved projects listed one per line, Enter = first, or type a number/name/path."""
from __future__ import annotations
from pathlib import Path
from typing import Optional


def ordered(projects: list, last: str = "") -> list:
    """Saved projects with the last used one first."""
    ps = [p for p in projects if p.get("active", True)]
    ps.sort(key=lambda p: 0 if last and last in (p["name"], p["path"]) else 1)
    return ps


def resolve_repo(projects: list, target: str) -> str:
    """Registered name -> its folder; anything else is returned as a path."""
    for p in projects:
        if p["name"] == target:
            return p["path"]
    return target


def pick_repo(projects: list, last: str = "", ask=None, title: str = "Which repo?") -> Optional[str]:
    """Returns a project name or a folder path; None = cancelled (q)."""
    ask = ask or input
    ps = ordered(projects, last)
    while True:
        print(f"\n{title}")
        if ps:
            w = max(len(p["name"]) for p in ps)
            for i, p in enumerate(ps, 1):
                tag = "   (last used)" if i == 1 and last and last in (p["name"], p["path"]) else ""
                print(f"  {i}  {p['name']:<{w}}  {p['path']}{tag}")
            v = ask("\nEnter = 1  ·  number or name  ·  or type a path  (q = cancel) > ").strip()
            if v == "":
                return ps[0]["name"]
        else:
            v = ask("No saved projects. Type the repo path (. = current folder, q = cancel) > ").strip() or "."
        if v.lower() == "q":
            return None
        if v.isdigit() and ps and 1 <= int(v) <= len(ps):
            return ps[int(v) - 1]["name"]
        if any(p["name"] == v for p in ps):
            return v
        path = str(Path(v).expanduser())
        if Path(path).is_dir():
            return path
        print(f"  Folder not found: {v}")
