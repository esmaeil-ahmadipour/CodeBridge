#!/usr/bin/env python3
"""
Repair the missing `fontVariables` export used by app/[locale]/layout.tsx.

Run from the project root:
    python3 fix_font_variables.py

The script:
- verifies the expected project files exist;
- checks whether `fontVariables` is already exported;
- detects exported font instances configured with a `variable` option;
- adds a backward-compatible `fontVariables` export;
- creates a timestamped backup before changing fonts.ts;
- is safe to run more than once.

It deliberately stops without editing if it cannot confidently identify
the font instances. In that case, inspect src/lib/fonts.ts manually.
"""

from __future__ import annotations

import re
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path.cwd()
FONTS_FILE = ROOT / "src" / "lib" / "fonts.ts"
LAYOUT_FILE = ROOT / "app" / "[locale]" / "layout.tsx"


def fail(message: str, code: int = 1) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(code)


def exported_names(source: str) -> set[str]:
    names: set[str] = set()

    # export const/let/var name = ...
    names.update(
        re.findall(r"\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)", source)
    )

    # export { foo, bar as baz }
    for block in re.findall(r"\bexport\s*\{([^}]+)\}", source, flags=re.S):
        for item in block.split(","):
            item = item.strip()
            match = re.match(
                r"([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$", item
            )
            if match:
                names.add(match.group(2) or match.group(1))

    return names


def detect_font_instances(source: str, names: set[str]) -> list[str]:
    """
    A candidate must be an exported identifier and have a nearby declaration
    whose initializer contains a `variable:` option. This avoids treating
    arbitrary exported values as fonts.
    """
    candidates: list[str] = []

    for name in sorted(names):
        # Match declarations such as:
        # export const inter = Inter({ ... variable: '--font-inter' ... });
        # const inter = Inter(...); export { inter };
        declaration = re.search(
            rf"\b(?:export\s+)?(?:const|let|var)\s+{re.escape(name)}\s*=",
            source,
        )
        if not declaration:
            continue

        tail = source[declaration.start():]
        # Limit the scan to the next declaration/export boundary to avoid
        # accidentally associating a different font's variable option.
        boundary = re.search(
            r"\n\s*(?:export\s+)?(?:const|let|var|function|class)\s+",
            tail[1:],
        )
        chunk = tail if not boundary else tail[: boundary.start() + 1]
        if re.search(r"\bvariable\s*:", chunk):
            candidates.append(name)

    return candidates


def main() -> None:
    if not FONTS_FILE.is_file():
        fail(f"File not found: {FONTS_FILE}")
    if not LAYOUT_FILE.is_file():
        fail(f"File not found: {LAYOUT_FILE}")

    fonts_source = FONTS_FILE.read_text(encoding="utf-8")
    layout_source = LAYOUT_FILE.read_text(encoding="utf-8")

    if not re.search(r"\bfontVariables\b", layout_source):
        fail(
            "layout.tsx does not reference `fontVariables`; "
            "this script will not make unrelated changes."
        )

    names = exported_names(fonts_source)

    if "fontVariables" in names:
        print("OK: `fontVariables` is already exported from src/lib/fonts.ts.")
        print("No changes made.")
        return

    candidates = detect_font_instances(fonts_source, names)

    if not candidates:
        fail(
            "Could not safely detect exported font instances configured with "
            "`variable:` in src/lib/fonts.ts. No files were changed. "
            "Please share src/lib/fonts.ts and app/[locale]/layout.tsx."
        )

    expression = ", ".join(f"{name}.variable" for name in candidates)
    addition = (
        "\n\n// Combined CSS variables for the application layout.\n"
        f"export const fontVariables = [{expression}].filter(Boolean).join(' ');\n"
    )

    backup = FONTS_FILE.with_name(
        f"fonts.ts.bak.{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    )
    backup.write_text(fonts_source, encoding="utf-8")

    # Preserve the file's existing newline convention.
    newline = "\r\n" if "\r\n" in fonts_source else "\n"
    addition = addition.replace("\n", newline)

    updated = fonts_source.rstrip() + addition
    FONTS_FILE.write_text(updated, encoding="utf-8")

    print("SUCCESS: Added the missing `fontVariables` export.")
    print("Detected font instances:", ", ".join(candidates))
    print(f"Updated: {FONTS_FILE.relative_to(ROOT)}")
    print(f"Backup:  {backup.name}")
    print("\nNext steps:")
    print("  1. Run: pnpm build")
    print("  2. If the build reports another error, share the new error output.")


if __name__ == "__main__":
    main()
