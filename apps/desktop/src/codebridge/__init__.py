import json
import re
import subprocess
from pathlib import Path

try:
    from ._version import __version__ as _generated_version
except ModuleNotFoundError as error:
    if error.name != f"{__name__}._version":
        raise
    _generated_version = None

_STABLE_VERSION = re.compile(r"[0-9]+\.[0-9]+\.[0-9]+\Z")


def get_version():
    if _generated_version is not None:
        return _generated_version

    for root in Path(__file__).resolve().parents:
        package_file = root / "package.json"
        if not package_file.is_file():
            continue
        try:
            package = json.loads(package_file.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        version = package.get("version") if isinstance(package, dict) else None
        if not isinstance(version, str) or not _STABLE_VERSION.fullmatch(version):
            continue
        try:
            result = subprocess.run(
                ["git", "-C", str(root), "rev-parse", "--short=7", "HEAD"],
                check=True,
                capture_output=True,
                text=True,
                timeout=2,
            )
            sha = result.stdout.strip()
        except (OSError, subprocess.SubprocessError):
            sha = ""
        return f"{version}-dev+{sha}" if sha else f"{version}-dev"
    return "0.0.0+unknown"


__version__ = get_version()
