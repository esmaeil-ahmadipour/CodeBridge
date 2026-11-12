import importlib.util
import json
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
CHANGELOG = REPO / "CHANGELOG.md"

_spec = importlib.util.spec_from_file_location(
    "changelog_section", REPO / "scripts" / "changelog_section.py"
)
changelog_section = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(changelog_section)


class ChangelogTests(unittest.TestCase):
    def setUp(self):
        self.text = CHANGELOG.read_text(encoding="utf-8")
        self.version = json.loads((REPO / "package.json").read_text(encoding="utf-8"))["version"]

    def test_current_version_has_exactly_one_non_empty_section(self):
        matches = changelog_section.extract_all(self.text, self.version)
        self.assertEqual(
            len(matches),
            1,
            f"CHANGELOG.md needs exactly one '## {self.version}' section",
        )
        self.assertTrue(matches[0], f"CHANGELOG.md '## {self.version}' section must not be empty")

    def test_matching_package_version_is_extracted(self):
        text = f"## {self.version}\nrelease notes\n"
        self.assertEqual(
            changelog_section.extract_all(text, self.version),
            ["release notes"],
        )

    def test_current_version_is_the_newest_heading(self):
        headings = [heading for heading, _ in changelog_section.sections(self.text)]
        self.assertEqual(headings[0], self.version)

    def test_headings_are_unique_and_descending(self):
        versions = [heading for heading, _ in changelog_section.sections(self.text)]
        self.assertEqual(len(versions), len(set(versions)), "duplicate version heading")
        keys = [tuple(map(int, v.split("."))) for v in versions]
        self.assertEqual(keys, sorted(keys, reverse=True), "versions must be newest first")

    def test_extract_stops_at_next_section(self):
        text = "# Changelog\n\n## 2.0.0\nnew\n\n## 1.0.0\nold\n"
        self.assertEqual(changelog_section.extract(text, "2.0.0"), "new")
        self.assertEqual(changelog_section.extract(text, "1.0.0"), "old")
        self.assertEqual(changelog_section.extract(text, "3.0.0"), "")
        self.assertEqual(changelog_section.extract_all(text, "3.0.0"), [])
        self.assertEqual(changelog_section.extract_all(text, "1.0.0"), ["old"])

    def test_extract_all_detects_duplicate_version_sections(self):
        text = "## 2.0.0\nfirst\n\n## 1.0.0\nold\n\n## 2.0.0\nsecond\n"
        self.assertEqual(changelog_section.extract_all(text, "2.0.0"), ["first", "second"])


if __name__ == "__main__":
    unittest.main()
