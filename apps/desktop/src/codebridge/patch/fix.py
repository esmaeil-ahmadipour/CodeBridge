"""Failure loop: build a ready-to-paste prompt (errors + current file contents) for the AI."""
from __future__ import annotations
import os
from ..context.exporter import build_report
from ..context.scanner import read_text

FIX_HEAD = (
    "# FIX REQUEST\n"
    "The diff you gave me could NOT be applied. Errors are below, followed by the CURRENT content "
    "of the affected files.\nReply with a corrected git unified diff ONLY for these files, written "
    "against exactly this content, inside ONE ```diff block.\n\n"
)


def build_fix_prompt(plan, o) -> str:
    failed = [n for n, (s, _) in plan.per_file.items() if s == "fail"]
    names = failed or [fp.name for fp in plan.patches]
    head = FIX_HEAD + "## ERRORS\n"
    for n in names:
        err = plan.per_file.get(n, ("fail", ""))[1] or plan.error
        head += f"- {n}: {err or 'cannot be applied'}\n"
    head += "\n"
    files, missing = [], []
    for n in names:
        full = os.path.join(plan.root, n)
        if os.path.isfile(full):
            text = read_text(full)
            if text is not None:
                files.append((n, os.path.getsize(full), text))
        else:
            missing.append(n)
    if missing:
        head += "## FILES THAT DO NOT EXIST YET\n" + "".join(f"- {m}\n" for m in missing) + "\n"
    o = dict(o, prompt_header=False, show_tree=False, show_token_estimate=False)
    return build_report("fix", plan.root, files, o, extra_head=head)[0]
