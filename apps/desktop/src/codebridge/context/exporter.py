"""Build the AI-friendly report and write it (with split, clipboard, backup)."""
from __future__ import annotations
import os, re, shutil, time, zipfile
from datetime import datetime
from pathlib import Path
from typing import Optional
from ..core.config import ExportConfig
from ..core.util import size_str, to_clipboard, CBError
from .scanner import collect

PROMPT_HEADER = (
    "# INSTRUCTIONS FOR THE AI\n"
    "Reply with code changes ONLY as a standard git unified diff inside ONE ```diff block:\n"
    "`diff --git a/x b/x`, `--- a/x`, `+++ b/x`, `@@` hunks, 3 lines of context.\n"
    "Use paths relative to the project root. Do not include explanations inside the block.\n\n"
)

SECRET_PATTERNS = [
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----", re.S),
     "[REDACTED PRIVATE KEY]"),
    (re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "[REDACTED AWS KEY]"),
    (re.compile(r"\bgh[pousr]_[A-Za-z0-9]{36,}\b"), "[REDACTED GITHUB TOKEN]"),
    (re.compile(r"\bsk-[A-Za-z0-9_\-]{20,}"), "[REDACTED API KEY]"),
    (re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}"), "[REDACTED SLACK TOKEN]"),
    (re.compile(r"(?i)\b((?:api[_-]?key|secret|token|passw(?:or)?d|private[_-]?key)\w*['\"]?\s*[:=]\s*)"
                r"(['\"])([^'\"\n]{8,})\2"), r"\1\2[REDACTED]\2"),
]


def tokens(text: str) -> int:
    return max(1, len(text) // 4)


def redact(text: str):
    total = 0
    for pat, rep in SECRET_PATTERNS:
        text, n = pat.subn(rep, text)
        total += n
    return text, total


def compact(text: str) -> str:
    text = "\n".join(l.rstrip() for l in text.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", text)


def tree(paths) -> str:
    root = {}
    for p in paths:
        node = root
        for part in p.split("/"):
            node = node.setdefault(part, {})
    lines = []

    def walk(n, pre=""):
        items = sorted(n.items(), key=lambda kv: (not kv[1], kv[0].lower()))
        for i, (k, v) in enumerate(items):
            last = i == len(items) - 1
            lines.append(f"{pre}{'`-- ' if last else '|-- '}{k}{'/' if v else ''}")
            walk(v, pre + ("    " if last else "|   "))
    walk(root)
    return "\n".join(lines)


LANGS = {".dart": "dart", ".yaml": "yaml", ".yml": "yaml", ".json": "json", ".arb": "json",
         ".html": "html", ".css": "css", ".js": "javascript", ".jsx": "jsx", ".ts": "typescript",
         ".tsx": "tsx", ".py": "python", ".sh": "bash", ".md": "markdown", ".txt": "text",
         ".bat": "batch", ".ps1": "powershell", ".toml": "toml", ".kt": "kotlin", ".java": "java",
         ".swift": "swift", ".go": "go", ".rs": "rust", ".c": "c", ".cpp": "cpp", ".cs": "csharp"}


def build_report(name, root, files, o, extra_head: str = ""):
    """-> list of report parts (strings)."""
    redacted = 0
    prepared = []
    for rel, size, text in files:
        if o.get("redact_secrets", True):
            try:
                text, n = redact(text)
            except Exception as exc:
                raise CBError(f"secret redaction failed for {rel}: {exc}") from exc
            redacted += n
        if o.get("compact"):
            text = compact(text)
        prepared.append((rel, size, text))
    head = ""
    if o.get("prompt_header", True):
        head += PROMPT_HEADER
    head += extra_head
    head += f"# PROJECT: {name}\n"
    if not o.get("anonymize_paths", True):
        head += f"# PATH: {root}\n"
    head += f"# Generated: {datetime.now():%Y-%m-%d %H:%M:%S}\n"
    if o["show_token_estimate"]:
        head += f"# FILES: {len(prepared)}   ~TOKENS: {sum(tokens(t) for _, _, t in prepared):,}\n"
    if redacted:
        head += f"# REDACTED: {redacted} secret(s) hidden\n"
    head += "#" + "-" * 70 + "\n\n"
    if o["show_tree"] and prepared:
        head += "## TREE\n```\n" + tree([f[0] for f in prepared]) + "\n```\n\n"
    blocks = []
    for rel, size, text in prepared:
        lang = LANGS.get(os.path.splitext(rel)[1].lower(), "")
        blocks.append(f"---\n\n/*\nFILE:  {rel}\nSIZE:  {size_str(size)}\n*/\n```{lang}\n{text.rstrip()}\n```\n\n")
    n = o["split_tokens"]
    if not n:
        return [head + "".join(blocks)]
    parts, cur, cnt = [], head, tokens(head)
    for b in blocks:
        t = tokens(b)
        if cnt + t > n and cur != head and cur != "":
            parts.append(cur)
            cur, cnt = "", 0
        cur += b
        cnt += t
    parts.append(cur)
    return parts


def do_backup(out_files, outdir, o) -> None:
    b = o["backup"]
    if not b["keep"]:
        return
    bdir = Path(outdir) / "backup"
    bdir.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    for f in out_files:
        f = Path(f)
        if b["compress"]:
            with zipfile.ZipFile(bdir / f"{f.stem}_{ts}.zip", "w", zipfile.ZIP_DEFLATED) as z:
                z.write(f, f.name)
        else:
            shutil.copy(f, bdir / f"{f.stem}_{ts}{f.suffix}")
    if b["days"]:
        cutoff = time.time() - b["days"] * 86400
        for old in bdir.iterdir():
            if old.is_file() and old.stat().st_mtime < cutoff:
                old.unlink()


def export_project(name, root, o, outdir=".", output=None, dry=False, backup=True,
                   only=None, clipboard=None, say=print,
                   export_cfg: Optional[ExportConfig] = None):
    """Export one project. Returns dict(files, outs, tokens) or None when nothing matched."""
    root = os.path.abspath(root)
    if not os.path.isdir(root):
        say(f"  x {name}: path not found: {root}")
        return None
    outdir = Path(outdir) / o["output_dir"] if not os.path.isabs(o["output_dir"]) else Path(o["output_dir"])
    safe = "".join(c if c.isalnum() or c in "-_." else "_" for c in name)
    out = Path(output) if output else outdir / f"code_report_{safe}.txt"
    files = collect(root, o, skip_abs={str(out.resolve())}, only=only, export_cfg=export_cfg)
    total = sum(s for _, s, _ in files)
    if dry:
        say(f"  [dry-run] {name}: {len(files)} files, {size_str(total)}")
        for rel, s, _ in files:
            say(f"    {rel}  ({size_str(s)})")
        return {"files": len(files), "outs": [], "tokens": 0}
    if not files:
        say(f"  - {name}: no files matched")
        return None
    out.parent.mkdir(parents=True, exist_ok=True)
    # Mandatory security: redaction cannot be disabled by any configuration.
    o["redact_secrets"] = True
    parts = build_report(name, root, files, o)
    outs = []
    for i, p in enumerate(parts, 1):
        f = out if len(parts) == 1 else out.with_name(f"{out.stem}_part{i}{out.suffix}")
        f.write_text(p, encoding="utf-8")
        outs.append(f)
    tk = sum(tokens(t) for _, _, t in files)
    est = f", ~{tk:,} tokens" if o["show_token_estimate"] else ""
    say(f"  OK {name}: {len(files)} files, {size_str(total)}{est}")
    for f in outs:
        say(f"    -> {f} ({size_str(f.stat().st_size)})")
    want_clip = o["copy_to_clipboard"] if clipboard is None else clipboard
    if want_clip and len(parts) == 1:
        say("    copied to clipboard" if to_clipboard(parts[0]) else "    clipboard unavailable")
    if backup:
        do_backup(outs, out.parent, o)
    return {"files": len(files), "outs": [str(f) for f in outs], "tokens": tk}
