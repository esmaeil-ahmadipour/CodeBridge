import os, subprocess, sys, tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

ENV = dict(os.environ, GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@t", GIT_COMMITTER_NAME="t",
           GIT_COMMITTER_EMAIL="t@t", GIT_CONFIG_GLOBAL=os.devnull, GIT_CONFIG_SYSTEM=os.devnull)
os.environ.update({k: ENV[k] for k in ("GIT_AUTHOR_NAME", "GIT_AUTHOR_EMAIL", "GIT_COMMITTER_NAME",
                                       "GIT_COMMITTER_EMAIL", "GIT_CONFIG_GLOBAL", "GIT_CONFIG_SYSTEM")})


def sh(cwd, *cmd):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, env=ENV, encoding="utf-8")
    assert r.returncode == 0, (cmd, r.stderr)
    return r.stdout


def make_repo(files: dict) -> Path:
    d = Path(tempfile.mkdtemp())
    sh(d, "git", "init", "-q")
    sh(d, "git", "config", "core.autocrlf", "false")
    for n, c in files.items():
        f = d / n
        f.parent.mkdir(parents=True, exist_ok=True)
        with f.open("w", encoding="utf-8", newline="") as stream:
            stream.write(c)
    sh(d, "git", "add", "-A")
    sh(d, "git", "commit", "-q", "-m", "init")
    return d


def make_diff(repo: Path, edits: dict) -> str:
    """Apply edits (None = delete), capture `git diff`, then restore the tree."""
    for n, c in edits.items():
        f = repo / n
        if c is None:
            f.unlink()
        else:
            f.parent.mkdir(parents=True, exist_ok=True)
            with f.open("w", encoding="utf-8", newline="") as stream:
                stream.write(c)
    sh(repo, "git", "add", "-A")
    d = sh(repo, "git", "diff", "--cached", "--no-color")
    sh(repo, "git", "reset", "-q", "--hard")
    sh(repo, "git", "clean", "-fdq")
    return d
