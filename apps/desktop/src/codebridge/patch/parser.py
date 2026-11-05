"""Turn whatever the AI gave us (prose, fences, CRLF) into a clean git diff and split it per file."""
from __future__ import annotations
import re
from dataclasses import dataclass
from ..core.util import CBError

HEADERS = ("diff --git ", "index ", "--- ", "+++ ", "new file mode", "deleted file mode",
           "old mode", "new mode", "similarity index", "dissimilarity index",
           "rename from", "rename to", "copy from", "copy to", "Binary files", "GIT binary patch")


@dataclass
class FilePatch:
    name: str            # path shown to the user (new path, or old for deletions)
    old: object          # old path or None (new file)
    new: object          # new path or None (deleted file)
    kind: str            # NEW | DEL | REN | MOD
    text: str            # this file's patch text, ends with newline
    added: int = 0
    removed: int = 0


def _fenced(lines):
    blocks, cur, inside = [], [], False
    for ln in lines:
        if not inside and ln.startswith("```"):
            inside, cur = True, []
        elif inside and ln.strip() == "```":
            inside = False
            blocks.append(cur)
        elif inside:
            cur.append(ln)
    if inside and cur:
        blocks.append(cur)
    good = [b for b in blocks if any(l.startswith(("diff --git ", "@@ ", "--- ")) for l in b)]
    if not good:
        return lines
    out = []
    for b in good:
        out += b
    return out


def _sanitize(lines):
    """Keep only diff lines; repair blank context lines; drop surrounding prose."""
    out, in_hunk, started = [], False, False   # out: (text, was_empty)

    def flush_tail():
        while out and out[-1][1]:
            out.pop()

    for i, ln in enumerate(lines):
        nxt = lines[i + 1] if i + 1 < len(lines) else ""
        if ln.startswith("diff --git "):
            flush_tail(); in_hunk = False; started = True
            out.append((ln, False)); continue
        if ln.startswith("@@"):
            in_hunk = started = True
            out.append((ln, False)); continue
        if in_hunk:
            if ln.startswith("--- ") and nxt.startswith("+++ "):
                flush_tail(); in_hunk = False; started = True
                out.append((ln, False)); continue
            if ln[:1] in (" ", "+", "-", "\\"):
                out.append((ln, False)); continue
            if ln == "":
                out.append((" ", True)); continue
            in_hunk = False
            continue
        if ln.startswith(HEADERS):
            started = True
            out.append((ln, False))
    flush_tail()
    return [t for t, _ in out]


def clean_diff(raw) -> str:
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8-sig", errors="replace")
    text = raw.lstrip("\ufeff").replace("\r\n", "\n").replace("\r", "\n")
    if not text.strip():
        raise CBError("the diff is empty")
    lines = _sanitize(_fenced(text.split("\n")))
    if not any(l.startswith(("diff --git ", "@@")) or (l.startswith("--- ")) for l in lines):
        raise CBError("input does not look like a git diff (need 'diff --git', '---/+++' or '@@' lines)")
    return "\n".join(lines).strip("\n") + "\n"


def _strip(path: str, p: int):
    path = path.split("\t")[0].strip().strip('"')
    if path == "/dev/null":
        return None
    if p >= 1 and "/" in path:
        return path.split("/", 1)[1]
    return path


def detect_p(text: str) -> int:
    return 1 if re.search(r"^(diff --git a/|--- a/|\+\+\+ b/)", text, re.M) else 0


def split_patches(text: str) -> list:
    lines = text.rstrip("\n").split("\n")
    chunks = []
    if any(l.startswith("diff --git ") for l in lines):
        for l in lines:
            if l.startswith("diff --git "):
                chunks.append([])
            if chunks:
                chunks[-1].append(l)
    else:
        cur = []
        for i, l in enumerate(lines):
            if l.startswith("--- ") and cur and any(x.startswith("@@") for x in cur):
                chunks.append(cur); cur = []
            cur.append(l)
        if cur:
            chunks.append(cur)
    p = detect_p(text)
    return [_make(c, p) for c in chunks if any(c)]


def _make(chunk: list, p: int) -> FilePatch:
    old = new = None
    rn_from = rn_to = None
    has_old = has_new = False
    new_mode = del_mode = False
    added = removed = 0
    in_hunk = False
    for l in chunk:
        if l.startswith("@@"):
            in_hunk = True
        elif in_hunk:
            if l.startswith("+") and not l.startswith("+++ "):
                added += 1
            elif l.startswith("-") and not l.startswith("--- "):
                removed += 1
            continue
        if l.startswith("rename from "):
            rn_from = l[12:].strip().strip('"')
        elif l.startswith("rename to "):
            rn_to = l[10:].strip().strip('"')
        elif l.startswith("new file mode"):
            new_mode = True
        elif l.startswith("deleted file mode"):
            del_mode = True
        elif l.startswith("--- ") and not has_old:
            old, has_old = _strip(l[4:], p), True
        elif l.startswith("+++ ") and not has_new:
            new, has_new = _strip(l[4:], p), True
    if not has_old and not has_new:           # header-only patch (rename, mode change, empty file)
        m = re.match(r"diff --git (?:a/)?(\S+) (?:b/)?(\S+)", chunk[0])
        a, b = (m.group(1), m.group(2)) if m else ("(unknown)", "(unknown)")
        old = None if new_mode else (rn_from or a)
        new = None if del_mode else (rn_to or b)
    if rn_from and rn_to:
        old, new = rn_from, rn_to
    kind = "NEW" if old is None else "DEL" if new is None else "REN" if old != new else "MOD"
    name = new if new is not None else old
    return FilePatch(name or "(unknown)", old, new, kind, "\n".join(chunk) + "\n", added, removed)
