from __future__ import annotations
import json, time
from pathlib import Path


def _file(cfg_path) -> Path:
    return Path(cfg_path).parent / "history.jsonl"


def add(cfg_path, **entry) -> None:
    entry["time"] = time.strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(_file(cfg_path), "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except OSError:
        pass


def read(cfg_path, n: int = 20) -> list:
    f = _file(cfg_path)
    if not f.is_file():
        return []
    out = []
    for ln in f.read_text(encoding="utf-8", errors="ignore").splitlines()[-n:]:
        try:
            out.append(json.loads(ln))
        except json.JSONDecodeError:
            pass
    return out
