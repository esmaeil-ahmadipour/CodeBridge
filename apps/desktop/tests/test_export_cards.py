import contextlib, io, os, re, tempfile, unittest
from pathlib import Path
import helpers
from helpers import make_repo
from codebridge.cli import main
from codebridge.ui import cards
from codebridge.ui.result import render

DIR = "/home/u/GIT/CodeBridge2/apps/desktop/launchers"
R = {"files": 77, "outs": [DIR + "/code_report_CodeBridge2.txt"], "tokens": 153549,
     "bytes": 636518, "sizes": [645529], "clipboard": None}


def text(card):
    return render(card, width=64)


class ExportCardTests(unittest.TestCase):
    def test_done_card_shows_file_name_and_folder_separately(self):
        out = text(cards.export_done("CodeBridge2", "/x", R))
        lines = out.split("\n")
        self.assertTrue(lines[0].startswith("✓ EXPORT DONE"))
        self.assertTrue(lines[0].endswith("CodeBridge2"))
        self.assertIn("77 files · ", lines[2])
        self.assertIn("~153,549 tokens", lines[2])
        self.assertRegex(out, r"(?m)^  File +code_report_CodeBridge2\.txt   \(.+\)$")
        self.assertRegex(out, r"(?m)^  Folder +" + re.escape(str(Path(DIR))) + "$")
        self.assertNotIn("Clipboard", out)

    def test_tokens_hidden_when_estimate_is_off(self):
        self.assertNotIn("tokens", text(cards.export_done("p", "/x", R, show_tokens=False)))

    def test_clipboard_row_and_warning(self):
        self.assertRegex(text(cards.export_done("p", "/x", dict(R, clipboard=True))), r"(?m)^  Clipboard +copied$")
        out = text(cards.export_done("p", "/x", dict(R, clipboard=False)))
        self.assertTrue(out.startswith("! EXPORT DONE · REVIEW"))
        self.assertRegex(out, r"(?m)^  Clipboard +unavailable$")

    def test_split_report_lists_every_part_in_one_folder(self):
        r = dict(R, outs=[DIR + "/a_part1.txt", DIR + "/a_part2.txt"], sizes=[10, 20])
        out = text(cards.export_done("p", "/x", r))
        self.assertIn("2 parts", out)
        self.assertRegex(out, r"(?m)^  File +a_part1\.txt ")
        self.assertRegex(out, r"(?m)^ {12}a_part2\.txt ")
        self.assertEqual(out.count("Folder"), 1)

    def test_preview_lists_files_and_writes_nothing(self):
        r = {"files": 2, "outs": [], "tokens": 0, "bytes": 2048, "list": [("a.py", "1.0 KB"), ("b/c.py", "1.0 KB")]}
        out = text(cards.export_preview("p", "/proj", r))
        self.assertTrue(out.startswith("○ EXPORT PREVIEW"))
        self.assertIn("2 files would be exported", out)
        self.assertIn("nothing was written", out)
        self.assertRegex(out, r"(?m)^  ✓ b/c\.py +1\.0 KB$")

    def test_empty_failed_and_summary(self):
        self.assertTrue(text(cards.export_empty("p", "/x")).startswith("! EXPORT EMPTY"))
        out = text(cards.export_failed("p", "/x", "path not found:\n/x"))
        self.assertTrue(out.startswith("✗ EXPORT FAILED"))
        self.assertRegex(out, r"(?m)^  Reason +path not found: /x$")
        self.assertTrue(text(cards.export_summary(3, 3)).startswith("✓ EXPORT SUMMARY"))
        self.assertTrue(text(cards.export_summary(1, 3)).startswith("! EXPORT SUMMARY"))
        self.assertTrue(text(cards.export_summary(0, 2)).startswith("✗ EXPORT SUMMARY"))


def call(*argv):
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        try:
            code = main(list(argv))
        except SystemExit as e:
            code = e.code
    return code, out.getvalue(), err.getvalue()


class CliExportTests(unittest.TestCase):
    def setUp(self):
        self.cfg = str(Path(tempfile.mkdtemp()) / "settings.json")
        self.cwd = os.getcwd()
        self.work = Path(tempfile.mkdtemp())
        os.chdir(self.work)
        self.addCleanup(os.chdir, self.cwd)

    def reports(self):
        return list(self.work.rglob("code_report_*.txt"))

    def test_export_prints_done_card_and_writes_the_report(self):
        proj = make_repo({"m.py": "print(1)\n"})
        c, out, err = call("--config", self.cfg, "context", "export", str(proj), "--no-backup")
        self.assertEqual(c, 0, out + err)
        self.assertIn("EXPORT DONE", out)
        self.assertRegex(out, r"(?m)^  File +code_report_\S+\.txt")
        self.assertRegex(out, r"(?m)^  Folder +\S")
        self.assertNotIn("  OK ", out)
        self.assertEqual(len(self.reports()), 1)

    def test_preview_prints_card_with_files_and_writes_nothing(self):
        proj = make_repo({"m.py": "print(1)\n"})
        c, out, err = call("--config", self.cfg, "context", "preview", str(proj))
        self.assertEqual(c, 0, out + err)
        self.assertIn("EXPORT PREVIEW", out)
        self.assertIn("m.py", out)
        self.assertEqual(self.reports(), [])

    def test_empty_project_is_exit_1_with_empty_card(self):
        empty = tempfile.mkdtemp()
        c, out, err = call("--config", self.cfg, "context", "export", empty)
        self.assertEqual(c, 1, out + err)
        self.assertIn("EXPORT EMPTY", out)

    def test_missing_folder_prints_failed_card_on_stderr(self):
        c, out, err = call("--config", self.cfg, "context", "export", str(self.work / "nope"))
        self.assertEqual(c, 1, out + err)
        self.assertIn("EXPORT FAILED", err)
        self.assertIn("path not found", err)

    def test_changed_outside_git_prints_failed_card_and_nonzero_code(self):
        plain = Path(tempfile.mkdtemp())
        (plain / "m.py").write_text("print(1)\n")
        c, out, err = call("--config", self.cfg, "context", "export", str(plain), "--changed")
        self.assertNotEqual(c, 0)
        self.assertIn("EXPORT FAILED", err)
        self.assertIn("need a git repository", err)


if __name__ == "__main__":
    unittest.main()
