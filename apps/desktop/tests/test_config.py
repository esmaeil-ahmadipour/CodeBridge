import json, tempfile, unittest
from pathlib import Path
import helpers  # noqa
from codebridge.core.config import load_settings, migrate


class T(unittest.TestCase):
    def setUp(self):
        self.p = Path(tempfile.mkdtemp()) / "settings.json"

    def test_missing_and_empty_restore(self):
        s = load_settings(self.p, quiet=True)
        self.assertEqual(s["version"], 3)
        self.p.write_text("")
        self.assertIn("patch", load_settings(self.p, quiet=True))

    def test_broken_backed_up(self):
        self.p.write_text("{oops")
        load_settings(self.p, quiet=True)
        self.assertTrue(Path(str(self.p) + ".bak").is_file())

    def test_codedump_v2_migrates(self):
        raw = {"version": 2, "defaults": {"only_extensions": ["py"], "max_file_mb": 3,
               "backup": {"keep": False, "days": 5}},
               "projects": [{"name": "a", "path": "/x", "overrides": {"include_extensions": ["md"]}}]}
        s = migrate(raw)
        self.assertEqual(s["defaults"]["only_extensions"], [".py"])
        self.assertFalse(s["defaults"]["backup"]["keep"])
        self.assertEqual(s["projects"][0]["overrides"]["only_extensions"], [".md"])
        self.assertTrue(s["patch"]["strict"])

    def test_v1_old_keys(self):
        s = migrate({"global": {"exclude_dirs": ["x"], "max_file_size_mb": 2}})
        self.assertEqual(s["defaults"]["skip_folders"], ["x"])
        self.assertEqual(s["defaults"]["max_file_mb"], 2)

    def test_patch_section_kept(self):
        s = migrate({"patch": {"strict": False, "bogus": 1}})
        self.assertFalse(s["patch"]["strict"])
        self.assertNotIn("bogus", s["patch"])


if __name__ == "__main__":
    unittest.main()
