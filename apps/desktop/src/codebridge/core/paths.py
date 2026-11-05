"""Where settings and history live."""
from __future__ import annotations
import os, sys
from pathlib import Path


def config_dir() -> Path:
    env = os.environ.get("CODEBRIDGE_HOME")
    if env:
        return Path(env)
    if sys.platform == "win32":
        return Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "codebridge"
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "codebridge"
    return Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "codebridge"


def resolve_config(arg=None) -> Path:
    """--config > $CODEBRIDGE_CONFIG > ./settings.json (if present) > user config dir."""
    if arg:
        return Path(arg).expanduser().resolve()
    env = os.environ.get("CODEBRIDGE_CONFIG")
    if env:
        return Path(env).expanduser().resolve()
    local = Path.cwd() / "settings.json"
    if local.is_file():
        return local
    return config_dir() / "settings.json"
