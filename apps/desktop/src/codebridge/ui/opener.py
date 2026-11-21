"""Open a file or folder with the system default application."""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


def open_path(path):
    """Open `path`. Returns None on success, or a short error text."""
    p = Path(str(path))
    if not p.exists():
        return f"not found: {p}"
    try:
        if sys.platform.startswith("win"):
            os.startfile(str(p))  # type: ignore[attr-defined]
        elif sys.platform == "darwin":
            subprocess.Popen(["open", str(p)])
        else:
            subprocess.Popen(["xdg-open", str(p)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except (OSError, ValueError) as e:
        return str(e)
    return None
