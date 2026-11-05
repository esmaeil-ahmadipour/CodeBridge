"""Small shared helpers: errors, subprocess, console, clipboard."""
from __future__ import annotations
import subprocess, sys


class CBError(Exception):
    """User-facing error. `code` becomes the process exit code."""
    def __init__(self, msg: str, code: int = 1):
        super().__init__(msg)
        self.code = code


def run(cmd, cwd=None, input_text=None):
    try:
        return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True,
                              encoding="utf-8", errors="replace", input=input_text)
    except FileNotFoundError:
        raise CBError(f"command not found: {cmd[0]} (is it installed and on PATH?)")


def size_str(n: int) -> str:
    return f"{n} B" if n < 1024 else f"{n/1024:.1f} KB" if n < 1048576 else f"{n/1048576:.1f} MB"


def setup_console() -> None:
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


def to_clipboard(text: str) -> bool:
    cmds = {"win32": ["clip"], "darwin": ["pbcopy"]}.get(sys.platform)
    cands = [cmds] if cmds else [["wl-copy"], ["xclip", "-selection", "clipboard"], ["xsel", "-ib"]]
    data = text.encode("utf-16" if sys.platform == "win32" else "utf-8")
    for c in cands:
        try:
            subprocess.run(c, input=data, check=True, capture_output=True)
            return True
        except Exception:
            continue
    return False


def from_clipboard():
    if sys.platform == "win32":
        cands = [["powershell", "-NoProfile", "-Command",
                  "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-Clipboard -Raw"]]
    elif sys.platform == "darwin":
        cands = [["pbpaste"]]
    else:
        cands = [["wl-paste", "-n"], ["xclip", "-selection", "clipboard", "-o"], ["xsel", "-ob"]]
    for c in cands:
        try:
            r = subprocess.run(c, capture_output=True, check=True)
            return r.stdout.decode("utf-8", errors="replace")
        except Exception:
            continue
    return None
