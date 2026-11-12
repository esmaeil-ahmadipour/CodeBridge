#!/usr/bin/env python3
"""Print the CHANGELOG section for a version (used as GitHub release notes).

Usage: changelog_section.py CHANGELOG.md X.Y.Z
Exits with an error if the section is missing or empty.
"""
import re
import sys
from pathlib import Path


def extract(text, version):
    heading = re.compile(rf"^##\s+v?{re.escape(version)}\s*$")
    lines, found = [], False
    for line in text.splitlines():
        if line.startswith("## "):
            if found:
                break
            found = bool(heading.match(line))
            continue
        if found:
            lines.append(line)
    return "\n".join(lines).strip()


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: changelog_section.py CHANGELOG.md X.Y.Z")
    body = extract(Path(sys.argv[1]).read_text(encoding="utf-8"), sys.argv[2])
    if not body:
        raise SystemExit(f"CHANGELOG.md has no '## {sys.argv[2]}' section (or it is empty).")
    print(body)


if __name__ == "__main__":
    main()
