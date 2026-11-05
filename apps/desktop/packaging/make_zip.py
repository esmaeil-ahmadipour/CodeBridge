"""Package one platform's CodeBridge binary into a release ZIP, and verify it.

    python packaging/make_zip.py build  --platform linux-x64 --binary dist/codebridge --out dist
    python packaging/make_zip.py verify dist/codebridge-linux-x64.zip --platform linux-x64 [--run]

Standard library only. Written in Python (not `zip`/`7z`) so it behaves the same on every runner
and keeps the executable bit on Linux/macOS files.
"""
import argparse
import os
import stat
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
DESKTOP = HERE.parent
LICENSE = DESKTOP.parent.parent / "LICENSE"

# platform -> (binary name inside the zip, launchers shipped next to it)
PLATFORMS = {
    "windows-x64": ("codebridge.exe", ["run.ps1"]),
    "linux-x64": ("codebridge", ["run.sh"]),
    "macos-arm64": ("codebridge", ["run.sh", "run_macos.command"]),
}

FIRST_RUN = {
    "windows-x64": "Windows SmartScreen may warn about an unsigned binary: More info -> Run anyway.",
    "linux-x64": "If needed: chmod +x codebridge run.sh",
    "macos-arm64": "First run: xattr -d com.apple.quarantine ./codebridge\n"
                   "(or right-click run_macos.command -> Open).",
}


def asset_name(platform):
    return "codebridge-%s.zip" % platform


def readme(platform, binary):
    launcher = "run.ps1" if platform.startswith("windows") else "run.sh"
    return (
        "CodeBridge (%s)\n\n"
        "Run it:\n"
        "  ./%s            interactive menu\n"
        "  ./%s --help     all commands\n"
        "  ./%s [args]     launcher that starts the binary next to it\n\n"
        "%s\n\n"
        "Git must be on your PATH for patch features. No Python needed.\n"
        "Docs: https://github.com/esmaeil-ahmadipour/codebridge\n"
    ) % (platform, binary, binary, launcher, FIRST_RUN[platform])


def _add(zf, root, arcname, data, executable):
    info = zipfile.ZipInfo("%s/%s" % (root, arcname))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.create_system = 3  # unix: lets the mode bits below survive
    info.external_attr = (0o755 if executable else 0o644) << 16
    zf.writestr(info, data)


def build_zip(platform, binary, out_dir):
    if platform not in PLATFORMS:
        raise SystemExit("unknown platform: %s" % platform)
    bin_name, launchers = PLATFORMS[platform]
    binary = Path(binary)
    if not binary.is_file() or binary.stat().st_size == 0:
        raise SystemExit("binary missing or empty: %s" % binary)
    root = "codebridge-%s" % platform
    out = Path(out_dir) / asset_name(platform)
    out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out, "w") as zf:
        _add(zf, root, bin_name, binary.read_bytes(), True)
        for name in launchers:
            _add(zf, root, name, (DESKTOP / "launchers" / name).read_bytes(), True)
        _add(zf, root, "README.txt", readme(platform, bin_name), False)
        if LICENSE.is_file():
            _add(zf, root, "LICENSE", LICENSE.read_bytes(), False)
    return out


def verify_zip(path, platform, run=False):
    """Check contents and sizes; with run=True also extract and execute `--version`."""
    path = Path(path)
    if not path.is_file() or path.stat().st_size == 0:
        raise SystemExit("missing or empty archive: %s" % path)
    if path.name != asset_name(platform):
        raise SystemExit("unexpected asset name: %s" % path.name)
    bin_name, launchers = PLATFORMS[platform]
    root = "codebridge-%s" % platform
    expected = [bin_name] + launchers + ["README.txt"]
    with zipfile.ZipFile(path) as zf:
        bad = zf.testzip()
        if bad:
            raise SystemExit("corrupt member: %s" % bad)
        sizes = {i.filename: i.file_size for i in zf.infolist()}
        for name in expected:
            key = "%s/%s" % (root, name)
            if sizes.get(key, 0) == 0:
                raise SystemExit("missing or empty in zip: %s" % key)
        if run:
            with tempfile.TemporaryDirectory() as tmp:
                for info in zf.infolist():
                    target = zf.extract(info, tmp)
                    mode = info.external_attr >> 16
                    if mode:
                        os.chmod(target, stat.S_IMODE(mode))
                exe = str(Path(tmp) / root / bin_name)
                res = subprocess.run([exe, "--version"], capture_output=True, text=True, timeout=120)
                if res.returncode != 0:
                    raise SystemExit("--version failed from zip: %s" % res.stderr)
                print("zip smoke test:", res.stdout.strip())
    print("OK", path.name)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = p.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build")
    b.add_argument("--platform", required=True)
    b.add_argument("--binary", required=True)
    b.add_argument("--out", required=True)
    v = sub.add_parser("verify")
    v.add_argument("zip")
    v.add_argument("--platform", required=True)
    v.add_argument("--run", action="store_true")
    a = p.parse_args(argv)
    if a.cmd == "build":
        print(build_zip(a.platform, a.binary, a.out))
    else:
        verify_zip(a.zip, a.platform, a.run)
    return 0


if __name__ == "__main__":
    sys.exit(main())
