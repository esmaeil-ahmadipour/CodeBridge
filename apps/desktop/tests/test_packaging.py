import importlib.util
import stat
import tempfile
import unittest
import zipfile
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent.parent / "packaging" / "make_zip.py"
spec = importlib.util.spec_from_file_location("make_zip", SCRIPT)
make_zip = importlib.util.module_from_spec(spec)
spec.loader.exec_module(make_zip)


class MakeZipTests(unittest.TestCase):
    def test_every_platform_builds_and_verifies(self):
        for platform, (bin_name, launchers) in make_zip.PLATFORMS.items():
            with self.subTest(platform=platform), tempfile.TemporaryDirectory() as tmp:
                fake = Path(tmp) / "fake-bin"
                fake.write_bytes(b"binary")
                out = make_zip.build_zip(platform, fake, tmp)
                self.assertEqual(out.name, "codebridge-%s.zip" % platform)
                make_zip.verify_zip(out, platform)
                root = "codebridge-%s/" % platform
                with zipfile.ZipFile(out) as zf:
                    names = set(zf.namelist())
                    for n in [bin_name, "README.txt"] + launchers:
                        self.assertIn(root + n, names)
                    mode = stat.S_IMODE(zf.getinfo(root + bin_name).external_attr >> 16)
                    self.assertEqual(mode, 0o755)

    def test_empty_binary_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            fake = Path(tmp) / "empty"
            fake.write_bytes(b"")
            with self.assertRaises(SystemExit):
                make_zip.build_zip("linux-x64", fake, tmp)

    def test_wrong_asset_name_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            fake = Path(tmp) / "b"
            fake.write_bytes(b"x")
            out = make_zip.build_zip("linux-x64", fake, tmp)
            with self.assertRaises(SystemExit):
                make_zip.verify_zip(out, "macos-arm64")


if __name__ == "__main__":
    unittest.main()
