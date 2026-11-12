import importlib.util
import json
import re
import unittest
from pathlib import Path

DESKTOP = Path(__file__).resolve().parents[1]
REPO = DESKTOP.parents[1]
CHANGELOG = DESKTOP / "CHANGELOG.md"

_spec = importlib.util.spec_from_file_location(
    "changelog_section", REPO / "scripts" / "changelog_section.py"
)
changelog_section = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(changelog_section)


def _headings(text):
    return re.findall(r"^## (\S+)\s*$", text, flags=re.MULTILINE)


class ChangelogTests(unittest.TestCase):
    def setUp(self):
        self.text = CHANGELOG.read_text(encoding="utf-8")
        self.version = json.loads((REPO / "package.json").read_text(encoding="utf-8"))["version"]

    def test_current_version_has_non_empty_section(self):
        body = changelog_section.extract(self.text, self.version)
        self.assertTrue(body, f"CHANGELOG.md needs a non-empty '## {self.version}' section")

    def test_current_version_is_the_newest_heading(self):
        self.assertEqual(_headings(self.text)[0], self.version)

    def test_headings_are_unique_and_descending(self):
        versions = _headings(self.text)
        self.assertEqual(len(versions), len(set(versions)), "duplicate version heading")
        keys = [tuple(map(int, v.split("."))) for v in versions]
        self.assertEqual(keys, sorted(keys, reverse=True), "versions must be newest first")

    def test_extract_stops_at_next_section(self):
        text = "# Changelog\n\n## 2.0.0\nnew\n\n## 1.0.0\nold\n"
        self.assertEqual(changelog_section.extract(text, "2.0.0"), "new")
        self.assertEqual(changelog_section.extract(text, "1.0.0"), "old")
        self.assertEqual(changelog_section.extract(text, "3.0.0"), "")


if __name__ == "__main__":
    unittest.main()
