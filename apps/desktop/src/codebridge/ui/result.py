"""One result card for every command outcome (export, apply, undo).

Presentation only: it builds text from a Result and prints it. It reads no
files, runs no commands and never changes an exit code. Every state uses the
same layout; only the mark, the colour and the content change.
"""
from __future__ import annotations

import os
import shutil
import sys
from dataclasses import dataclass, field

OK, WARN, ERROR, CANCEL = "ok", "warn", "error", "cancel"

MAX_WIDTH = 64
MIN_WIDTH = 40
_NAME_CAP = 44
_INDENT = "  "
_PROBE = "─✓✗○·−—…"

_MARK = {OK: "✓", WARN: "!", ERROR: "✗", CANCEL: "○"}
_MARK_ASCII = {OK: "[OK]", WARN: "[!]", ERROR: "[X]", CANCEL: "[-]"}
_FILE_ASCII = {OK: "+", WARN: "!", ERROR: "x", CANCEL: "-"}
_COLOR = {OK: "32", WARN: "33", ERROR: "31", CANCEL: "90"}
_DIM = "90"
_ASCII_MAP = str.maketrans({"─": "-", "−": "-", "·": "-", "—": "-", "…": "..."})


@dataclass
class FileLine:
    status: str          # OK / WARN / ERROR / CANCEL
    name: str
    kind: str = ""       # M, A, D ...
    stat: str = ""       # "+12 −3"
    note: str = ""       # reason or remark
    detail: list = field(default_factory=list)  # extra lines under the file


@dataclass
class Result:
    status: str
    title: str                                   # e.g. "EXPORT DONE"
    project: str = ""
    summary: str = ""
    rows: list = field(default_factory=list)     # [(label, value)]
    files: list = field(default_factory=list)    # [FileLine]
    footer: list = field(default_factory=list)   # plain lines under the last rule
    actions: list = field(default_factory=list)  # [(key, label)]
    open: dict = field(default_factory=dict)     # key -> path opened by that action


def _is_tty(stream) -> bool:
    fn = getattr(stream, "isatty", None)
    try:
        return bool(fn and fn())
    except Exception:
        return False


def use_color(stream, env=None) -> bool:
    env = os.environ if env is None else env
    if env.get("NO_COLOR") or env.get("TERM") == "dumb":
        return False
    return _is_tty(stream)


def use_unicode(stream) -> bool:
    enc = getattr(stream, "encoding", None)
    if not enc:
        return True
    try:
        _PROBE.encode(enc)
    except (UnicodeError, LookupError):
        return False
    return True


def _width() -> int:
    cols = shutil.get_terminal_size((MAX_WIDTH + 1, 24)).columns
    return max(MIN_WIDTH, min(MAX_WIDTH, cols - 1))


def render(r: Result, *, color: bool = False, unicode: bool = True,
           width: int = MAX_WIDTH, actions: bool = True) -> str:
    st = r.status if r.status in _MARK else CANCEL

    def tr(s) -> str:
        s = str(s)
        return s if unicode else s.translate(_ASCII_MAP)

    def paint(text: str, code: str, bold: bool = False) -> str:
        if not color:
            return text
        return f"\x1b[{'1;' if bold else ''}{code}m{text}\x1b[0m"

    # header: mark + title on the left, project on the right
    left = f"{_MARK[st] if unicode else _MARK_ASCII[st]} {tr(r.title)}"
    project = tr(r.project)
    room = width - len(left) - 2
    if project and room < 6:
        project = ""
    elif len(project) > room:
        ell = "…" if unicode else "..."
        project = ell + project[-(room - len(ell)):]
    gap = max(2, width - len(left) - len(project)) if project else 0
    head = paint(left, _COLOR[st], bold=True) + (" " * gap + project if project else "")
    rule = tr("─") * width

    body = []
    if r.summary:
        body.append(_INDENT + tr(r.summary))
    if r.rows:
        if body:
            body.append("")
        lw = max(8, max(len(k) for k, _ in r.rows))
        for k, v in r.rows:
            body.append(_INDENT + paint(k.ljust(lw), _DIM) + "  " + tr(v))
    if r.files:
        if body:
            body.append("")
        names = [tr(f.name) for f in r.files]
        stats = [tr(f.stat) for f in r.files]
        nw = min(max(len(n) for n in names), _NAME_CAP)
        kw = max(len(f.kind) for f in r.files)
        sw = max(len(s) for s in stats)
        for f, name, stat in zip(r.files, names, stats):
            fs = f.status if f.status in _MARK else CANCEL
            mark = _MARK[fs] if unicode else _FILE_ASCII[fs]
            line = _INDENT + paint(mark, _COLOR[fs]) + " "
            if kw:
                line += f.kind.ljust(kw) + "  "
            line += name.ljust(nw)
            if sw:
                line += "  " + stat.ljust(sw)
            if f.note:
                line += "  " + tr(f.note)
            body.append(line)
            for dl in f.detail:
                body.append(_INDENT * 3 + paint(tr(dl), _DIM))

    lines = [head, rule]
    if body:
        lines += body + [rule]
    for t in r.footer:
        lines.append(_INDENT + tr(t))
    if actions and r.actions:
        lines.append(_INDENT + "   ".join(f"[{k}] {tr(lbl)}" for k, lbl in r.actions))
    return "\n".join(x.rstrip() for x in lines)


_state = {"prompted": False}


def reset_prompted() -> None:
    _state["prompted"] = False


def was_prompted() -> bool:
    """True when the last card already waited for a key (the caller need not pause again)."""
    return _state["prompted"]


def _prompt(r: Result, stream) -> None:
    _state["prompted"] = True
    while True:
        try:
            key = input("  > ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print(file=stream)
            return
        path = r.open.get(key)
        if not path:
            return
        from .opener import open_path
        err = open_path(path)
        print(f"  ! Could not open: {err}" if err else "  Opened.", file=stream)


def emit(r: Result, stream=None, *, actions=None) -> None:
    """Print a card. Errors go to stderr, everything else to stdout.

    In an interactive terminal (unless `actions` is given) the key line is shown and
    a key is read: o/f/x open the card's file, folder or fix prompt; Enter continues.
    """
    if stream is None:
        stream = sys.stderr if r.status == ERROR else sys.stdout
    if actions is None:
        actions = _is_tty(sys.stdin) and _is_tty(stream)
    print(render(r, color=use_color(stream), unicode=use_unicode(stream),
                 width=_width(), actions=actions), file=stream)
    if actions and r.open:
        _prompt(r, stream)
