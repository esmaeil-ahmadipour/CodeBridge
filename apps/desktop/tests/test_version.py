import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import codebridge


class VersionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.package_dir = self.root / "apps" / "desktop" / "src" / "codebridge"
        self.package_dir.mkdir(parents=True)
        self.package_init = self.package_dir / "__init__.py"
        self.package_init.touch()
        self.file_patch = mock.patch.object(codebridge, "__file__", str(self.package_init))
        self.file_patch.start()
        self.addCleanup(self.file_patch.stop)

    def test_generated_version_is_clean(self):
        with mock.patch.object(codebridge, "_generated_version", "2.2.4"):
            self.assertEqual(codebridge.get_version(), "2.2.4")

    def test_source_checkout_includes_dev_and_git_sha(self):
        (self.root / "package.json").write_text(
            json.dumps({"version": "2.2.4"}), encoding="utf-8"
        )
        git = mock.Mock(stdout="abc1234\n")
        with mock.patch.object(codebridge, "_generated_version", None), mock.patch.object(
            codebridge.subprocess, "run", return_value=git
        ) as run:
            self.assertEqual(codebridge.get_version(), "2.2.4-dev+abc1234")
        run.assert_called_once_with(
            ["git", "-C", str(self.root), "rev-parse", "--short=7", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
            timeout=2,
        )

    def test_source_checkout_without_git_still_has_dev_version(self):
        (self.root / "package.json").write_text(
            json.dumps({"version": "2.2.4"}), encoding="utf-8"
        )
        with mock.patch.object(codebridge, "_generated_version", None), mock.patch.object(
            codebridge.subprocess, "run", side_effect=FileNotFoundError
        ):
            self.assertEqual(codebridge.get_version(), "2.2.4-dev")

    def test_missing_version_source_uses_unknown(self):
        with mock.patch.object(codebridge, "_generated_version", None), mock.patch.object(
            codebridge.subprocess, "run"
        ) as run:
            self.assertEqual(codebridge.get_version(), "0.0.0+unknown")
        run.assert_not_called()

    def test_package_without_version_uses_unknown(self):
        (self.root / "package.json").write_text(
            json.dumps({"name": "codebridge"}), encoding="utf-8"
        )
        with mock.patch.object(codebridge, "_generated_version", None), mock.patch.object(
            codebridge.subprocess, "run"
        ) as run:
            self.assertEqual(codebridge.get_version(), "0.0.0+unknown")
        run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
