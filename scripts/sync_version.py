#!/usr/bin/env python3
"""Generate the desktop package version from the repository root package.json."""
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKAGE_FILE = ROOT / "package.json"
VERSION_FILE = ROOT / "apps" / "desktop" / "src" / "codebridge" / "_version.py"
VERSION_PATTERN = re.compile(r"[0-9]+\.[0-9]+\.[0-9]+\Z")


def main():
    try:
        package = json.loads(PACKAGE_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        raise SystemExit(f"cannot read {PACKAGE_FILE}: {error}") from error

    version = package.get("version") if isinstance(package, dict) else None
    if not isinstance(version, str) or not VERSION_PATTERN.fullmatch(version):
        raise SystemExit(
            f"invalid package.json version {version!r}; expected X.Y.Z (for example 2.2.1)"
        )

    VERSION_FILE.write_text(f'__version__ = "{version}"\n', encoding="utf-8")
    print(f"Synchronized desktop version to {version}")


if __name__ == "__main__":
    main()
