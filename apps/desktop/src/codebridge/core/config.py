"""Settings: CodeDump v1/v2 compatible, plus a `patch` section (version 3)."""
from __future__ import annotations
import copy, json, shutil
from pathlib import Path

VERSION = 3

DEFAULTS = {
    "only_extensions": [],
    "skip_folders": ["node_modules", "dist", "build", "out", "__pycache__", "venv", ".venv",
                     ".git", ".dart_tool", ".idea"],
    "skip_files": ["*.log", "*.tmp", ".env*", "package-lock.json", "yarn.lock",
                   "pnpm-lock.yaml", "pubspec.lock", "poetry.lock"],
    "skip_if_contains": [".freezed.dart", ".g.dart", ".gr.dart", ".mocks.dart", "generated"],
    "max_file_mb": 10,
    "include_hidden": False,
    "use_gitignore": True,
    "show_tree": True,
    "show_token_estimate": True,
    "sort_by": "path",
    "split_tokens": 0,
    "copy_to_clipboard": False,
    "output_dir": ".",
    "prompt_header": True,
    "redact_secrets": True,
    "anonymize_paths": True,
    "compact": False,
    "backup": {"keep": True, "compress": False, "days": 30},
}

PATCH_DEFAULTS = {
    "strict": True,
    "confirm_before_apply": True,
    "auto_commit": False,
    "create_branch": False,
    "archive_applied": True,
}

# key -> (label, type, help, choices)
SPEC = {
    "only_extensions": ("File types to include", "list", "e.g. .py .md  (empty = ALL types)", None),
    "skip_folders": ("Folders to skip", "list", "folder names, wildcards ok", None),
    "skip_files": ("Files to skip", "list", "wildcards, e.g. *.log", None),
    "skip_if_contains": ("Skip paths containing", "list", "any text inside the path", None),
    "max_file_mb": ("Max file size (MB)", "int", "bigger files are skipped", None),
    "include_hidden": ("Include hidden files", "bool", "dotfiles", None),
    "use_gitignore": ("Respect .gitignore", "bool", "", None),
    "show_tree": ("Show folder tree", "bool", "", None),
    "show_token_estimate": ("Show token estimate", "bool", "rough: chars / 4", None),
    "sort_by": ("Sort files by", "choice", "", ["path", "size"]),
    "split_tokens": ("Split report every N tokens", "int", "0 = no split", None),
    "copy_to_clipboard": ("Copy report to clipboard", "bool", "", None),
    "output_dir": ("Output folder", "text", "relative to where you run codebridge", None),
    "prompt_header": ("Add AI instructions to report", "bool", "asks the AI for a unified diff", None),
    "redact_secrets": ("Redact secrets in report", "bool", "keys, tokens, private keys", None),
    "anonymize_paths": ("Hide absolute paths", "bool", "", None),
    "compact": ("Compact report", "bool", "squeeze blank lines, trim spaces", None),
}
PATCH_SPEC = {
    "strict": ("Strict (all-or-nothing)", "bool", "off = apply what can be applied", None),
    "confirm_before_apply": ("Ask before applying", "bool", "", None),
    "auto_commit": ("Auto-commit applied files", "bool", "", None),
    "create_branch": ("Create a branch per run", "bool", "", None),
    "archive_applied": ("Archive applied diff file", "bool", "", None),
}

PRESETS = {
    "flutter": {"skip_folders": ["build", ".dart_tool", ".idea", "android/.gradle", "ios/Pods"],
                "skip_if_contains": [".freezed.dart", ".g.dart", ".gr.dart", ".mocks.dart"],
                "only_extensions": [".dart", ".yaml", ".arb", ".md", ".json"]},
    "node": {"skip_folders": ["node_modules", "dist", "build", ".next", "coverage"],
             "skip_if_contains": [".min.js"],
             "only_extensions": [".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".md"]},
    "python": {"skip_folders": ["__pycache__", "venv", ".venv", "dist", "build", ".pytest_cache"],
               "skip_if_contains": [".pyc"],
               "only_extensions": [".py", ".toml", ".cfg", ".md", ".txt", ".yaml"]},
    "all": {"only_extensions": []},
}

OLD_KEYS = {"include_extensions": "only_extensions", "exclude_dirs": "skip_folders",
            "exclude_files": "skip_files", "exclude_patterns": "skip_if_contains",
            "max_file_size_mb": "max_file_mb"}
OLD_BACKUP = {"enabled": "keep", "compress": "compress", "retention_days": "days"}


def default_settings() -> dict:
    return {"version": VERSION, "defaults": copy.deepcopy(DEFAULTS),
            "patch": copy.deepcopy(PATCH_DEFAULTS), "projects": []}


def _norm_opts(d) -> dict:
    out = {}
    for k, v in (d or {}).items():
        k = OLD_KEYS.get(k, k)
        if v is None or k == "output_format":
            continue
        if k == "backup" and isinstance(v, dict):
            v = {OLD_BACKUP.get(a, a): b for a, b in v.items() if b is not None}
        if k == "only_extensions":
            v = [e.lower() if e.startswith((".", "*")) else "." + e.lower() for e in v]
            if v == ["*"]:
                v = []
        out[k] = v
    return out


def migrate(raw: dict) -> dict:
    """Accept CodeDump v1/v2 or CodeBridge v3 settings; return v3 filled with defaults."""
    s = default_settings()
    d = _norm_opts(raw.get("defaults", raw.get("global")))
    bk = d.pop("backup", {})
    s["defaults"].update(d)
    s["defaults"]["backup"].update(bk)
    s["patch"].update({k: v for k, v in (raw.get("patch") or {}).items() if k in PATCH_DEFAULTS})
    for p in raw.get("projects") or []:
        ov = {k: v for k, v in p.items() if k in OLD_KEYS or k in DEFAULTS}
        ov.update(p.get("overrides") or p.get("options") or {})
        s["projects"].append({"name": p.get("name") or Path(p.get("path", "x")).name,
                              "path": p.get("path", ""),
                              "active": p.get("active", p.get("enabled", True)),
                              "overrides": _norm_opts(ov)})
    return s


def save_settings(s: dict, path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(s, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_settings(path, quiet: bool = False) -> dict:
    """Missing / empty / broken file => restored to defaults (broken is backed up)."""
    path = Path(path)
    msg = None
    if path.is_file():
        text = path.read_text(encoding="utf-8-sig", errors="ignore").strip()
        if text:
            try:
                return migrate(json.loads(text))
            except (json.JSONDecodeError, AttributeError, TypeError) as e:
                shutil.copy(path, str(path) + ".bak")
                msg = f"settings invalid ({e}); old file saved as {path.name}.bak, defaults restored"
        else:
            msg = "settings file was empty; defaults restored"
    else:
        msg = f"settings created with defaults: {path}"
    s = default_settings()
    save_settings(s, path)
    if msg and not quiet:
        print(f"note: {msg}")
    return s


def project_options(s: dict, proj=None) -> dict:
    o = copy.deepcopy(s["defaults"])
    if proj:
        for k, v in (proj.get("overrides") or {}).items():
            if k == "backup":
                o["backup"].update(v)
            else:
                o[k] = v
    return o
