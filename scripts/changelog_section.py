#!/usr/bin/env python3
"""Parse and print CHANGELOG sections (used as GitHub release notes).

Usage: changelog_section.py CHANGELOG.md X.Y.Z
Exits with an error unless exactly one non-empty section matches the version.
"""
import re
import sys
from pathlib import Path


def sections(text):
    parsed, heading, lines = [], None, []
    for line in text.splitlines():
        if line.startswith("## "):
            if heading is not None:
                parsed.append((heading, "\n".join(lines).strip()))
            heading = line[3:].strip()
            lines = []
            continue
        if heading is not None:
            lines.append(line)
    if heading is not None:
        parsed.append((heading, "\n".join(lines).strip()))
    return parsed


def extract_all(text, version):
    heading = re.compile(rf"v?{re.escape(version)}")
    return [
        body
        for title, body in sections(text)
        if heading.fullmatch(title)
    ]


def extract(text, version):
    matches = extract_all(text, version)
    return matches[0] if matches else ""


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: changelog_section.py CHANGELOG.md X.Y.Z")
    matches = extract_all(Path(sys.argv[1]).read_text(encoding="utf-8"), sys.argv[2])
    if not matches:
        raise SystemExit(f"CHANGELOG.md has no '## {sys.argv[2]}' section (or it is empty).")
    if len(matches) > 1:
        raise SystemExit(f"CHANGELOG.md has multiple '## {sys.argv[2]}' sections.")
    if not matches[0]:
        raise SystemExit(f"CHANGELOG.md has no '## {sys.argv[2]}' section (or it is empty).")
    print(matches[0])


if __name__ == "__main__":
    main()
