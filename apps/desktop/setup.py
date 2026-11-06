import subprocess
import sys
from pathlib import Path

from setuptools import setup


PROJECT_ROOT = Path(__file__).resolve().parent
REPOSITORY_ROOT = PROJECT_ROOT.parents[1]
PACKAGE_JSON = REPOSITORY_ROOT / "package.json"
GENERATED_VERSION = PROJECT_ROOT / "src" / "codebridge" / "_version.py"

generated_by_setup = PACKAGE_JSON.is_file()
if generated_by_setup:
    subprocess.run(
        [sys.executable, str(REPOSITORY_ROOT / "scripts" / "sync_version.py")],
        check=True,
    )
elif not GENERATED_VERSION.is_file():
    raise RuntimeError(
        "version source is unavailable: package.json and generated _version.py are missing"
    )

try:
    setup()
finally:
    if generated_by_setup:
        GENERATED_VERSION.unlink(missing_ok=True)
