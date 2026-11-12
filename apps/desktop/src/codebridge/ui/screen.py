"""One-screen export form: tick everything on a single page, Enter = export."""
from __future__ import annotations
import os
import sys
from pathlib import Path
from typing import Optional

from .repo import pick_repo, resolve_repo

TYPES = ["flutter", "react", "nextjs", "node", "python", "other"]
LANGS = ["dart", "javascript", "typescript", "python", "go", "rust", "java", "kotlin", "swift", "c#"]
LANG_KEYS = "abcdefghij"
DEFAULT_LANGS = {
    "flutter": ["dart"], "react": ["javascript", "typescript"], "nextjs": ["javascript", "typescript"],
    "node": ["javascript", "typescript"], "python": ["python"], "other": [],
}
OPTS = {"s": "Include SVG contents", "l": "Exclude lock files", "t": "Exclude tests", "o": "Only changed files"}
W = 54


def detect_type(folder: str) -> Optional[str]:
    p = Path(folder)
    if (p / "pubspec.yaml").is_file():
        return "flutter"
    if any(p.glob("next.config.*")):
        return "nextjs"
    if (p / "package.json").is_file():
        return "node"
    if (p / "pyproject.toml").is_file() or (p / "requirements.txt").is_file():
        return "python"
    return None


def initial_state(project: str = ".", saved: Optional[dict] = None, projects: Optional[list] = None) -> dict:
    """Defaults: detected from the folder; other choices from the last export."""
    saved = saved or {}
    ptype = detect_type(resolve_repo(projects or [], project)) or saved.get("project_type") or "flutter"
    same = ptype == saved.get("project_type")
    langs = list(saved.get("languages") or []) if same and saved.get("languages") else list(DEFAULT_LANGS.get(ptype, []))
    return {
        "project": project, "projects": projects or [], "ptype": ptype,
        "custom_type": (saved.get("custom_project_type", "") or "") if same else "",
        "langs": [l for l in langs if l in LANGS], "custom_langs": list(saved.get("custom_languages") or []) if same else [],
        "s": bool(saved.get("include_svg", False)),
        "l": bool(saved.get("exclude_lock_files", True)),
        "t": bool(saved.get("exclude_test_files", True)),
        "o": False,
    }


def summary(st: dict) -> str:
    kind = st["custom_type"] or st["ptype"]
    langs = ", ".join(st["langs"] + st["custom_langs"]) or "no language!"
    parts = [kind, langs, "with SVG" if st["s"] else None, "no locks" if st["l"] else "with locks",
             "no tests" if st["t"] else "with tests", "changed files only" if st["o"] else None]
    return "Will export: " + " · ".join(x for x in parts if x)


def _row(text: str = "") -> str:
    return "│ " + text.ljust(W - 2)[: W - 2] + " │"


def render(st: dict, title: str = "CodeBridge") -> str:
    inner = W
    head = f"─ {title} ─ Export "
    out = ["┌" + head + "─" * (inner - len(head)) + "┐"]
    out.append(_row(f"Project : [ {st['project']} ]   (p) change"))
    out.append(_row())
    out.append(_row("Type (one)         Languages (multi)"))
    for i in range(6):
        t = TYPES[i]
        left = f"({'•' if st['ptype'] == t else ' '}) {i + 1} {t}"
        if t == "other" and st["custom_type"]:
            left = f"(•) 6 {st['custom_type']}"
        cells = []
        for j in (i, i + 5):
            if i < 5:
                cells.append(f"[{'x' if LANGS[j] in st['langs'] else ' '}] {LANG_KEYS[j]} {LANGS[j]}")
        out.append(_row(left.ljust(19) + " ".join(c.ljust(16) for c in cells)))
    extra = ", ".join(st["custom_langs"])
    out.append(_row(f"Custom languages (x): {extra or '-'}"))
    out.append(_row())
    out.append(_row("Options"))
    for k, label in OPTS.items():
        out.append(_row(f" [{'x' if st[k] else ' '}] {k}  {label}"))
    out.append(_row(" [x]    Redact secrets (always on)"))
    out.append("├" + "─" * inner + "┤")
    out.append(_row("1-6 type · a-j languages · s l t o options"))
    out.append(_row("p project · x custom language · q quit"))
    out.append("└" + "─" * inner + "┘")
    return "\n".join(out)


def apply_keys(st: dict, keys: str, ask=None) -> Optional[str]:
    """Apply typed keys to the state. Returns 'quit' or None."""
    ask = ask or input
    for ch in keys.replace(",", " ").replace(" ", ""):
        ch = ch.lower()
        if ch == "q":
            return "quit"
        if ch in "123456":
            t = TYPES[int(ch) - 1]
            if t == "other":
                name = ask("Custom project type: ").strip()
                if not name:
                    continue
                st["custom_type"] = name
            else:
                st["custom_type"] = ""
            if t != st["ptype"] or t == "other":
                st["langs"] = list(DEFAULT_LANGS[t])
            st["ptype"] = t
        elif ch in LANG_KEYS:
            lang = LANGS[LANG_KEYS.index(ch)]
            st["langs"].remove(lang) if lang in st["langs"] else st["langs"].append(lang)
        elif ch in OPTS:
            st[ch] = not st[ch]
        elif ch == "p":
            v = pick_repo(st.get("projects", []), st["project"], ask, "Export which project?")
            if v:
                st["project"] = v
                d = detect_type(resolve_repo(st.get("projects", []), v))
                if d and d != st["ptype"]:
                    st.update(ptype=d, custom_type="", langs=list(DEFAULT_LANGS[d]), custom_langs=[])
        elif ch == "x":
            v = ask("Custom languages (space separated): ").replace(",", " ").split()
            for x in v:
                x = x.lower()
                if x not in st["custom_langs"] and x not in st["langs"]:
                    st["custom_langs"].append(x)
    return None


def to_export_dict(st: dict) -> dict:
    return {
        "project_type": st["ptype"], "custom_project_type": st["custom_type"],
        "languages": list(st["langs"]), "custom_languages": list(st["custom_langs"]),
        "include_svg": st["s"], "exclude_lock_files": st["l"], "exclude_test_files": st["t"],
    }


def error_of(st: dict) -> str:
    if not st["langs"] and not st["custom_langs"]:
        return "Pick at least one language (a-j or x)."
    return ""


def run_screen(project: str = ".", saved: Optional[dict] = None, projects: Optional[list] = None) -> Optional[dict]:
    """Show the form until Enter (export) or q. Returns the state, or None if cancelled."""
    st = initial_state(project, saved, projects)
    err = ""
    while True:
        if sys.stdout.isatty() and os.environ.get("TERM"):
            print("\033[H\033[J", end="")
        print(summary(st))
        print(render(st))
        print('Tick: type keys, e.g. "1 a t", then Enter.   Enter alone = export what you see.')
        if err:
            print("  ! " + err)
        try:
            keys = input("> ").strip()
        except EOFError:
            return None
        if keys == "":
            err = error_of(st)
            if not err:
                return st
            continue
        err = ""
        if apply_keys(st, keys) == "quit":
            return None
