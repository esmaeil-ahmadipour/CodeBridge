import contextlib, io, os, tempfile, types, unittest
from pathlib import Path
import helpers
from helpers import make_repo, make_diff
from codebridge.cli import main
from codebridge.ui import cards
from codebridge.ui.result import render

ROOT = "/home/u/GIT/CodeBridge2"
META = {"id": "20261120-130200", "files": [{"name": "a"}, {"name": "b"}], "skipped": [],
        "notes": [], "branch": None, "commit": None}


def text(card):
    return render(card, width=64)


class CardBuilderTests(unittest.TestCase):
    def test_apply_done_ok(self):
        meta = dict(META, branch="codebridge/x", commit="Apply AI patch")
        out = text(cards.apply_done(ROOT, "clipboard", meta, archived="d.patch.applied-1"))
        lines = out.split("\n")
        self.assertTrue(lines[0].startswith("✓ APPLY DONE"))
        self.assertTrue(lines[0].endswith("CodeBridge2"))
        self.assertIn("2 files applied", out)
        for label in ("Repo", "Source", "Run", "Branch", "Commit", "Archived"):
            self.assertRegex(out, rf"(?m)^  {label} +\S")
        self.assertEqual(lines[-1], f'  Undo: codebridge patch undo -r "{ROOT}"')

    def test_apply_done_single_file_and_no_optional_rows(self):
        out = text(cards.apply_done(ROOT, "x", dict(META, files=[{"name": "a"}])))
        self.assertIn("1 file applied", out)
        for label in ("Branch", "Commit", "Archived", "Mode", "Note"):
            self.assertNotRegex(out, rf"(?m)^  {label} ")

    def test_apply_done_tolerant_and_notes_need_review(self):
        out = text(cards.apply_done(ROOT, "x", dict(META, notes=["commit failed"]), flags=["--recount"]))
        self.assertTrue(out.startswith("! APPLY DONE · REVIEW"))
        self.assertIn("tolerant (--recount)", out)
        self.assertRegex(out, r"(?m)^  Note +commit failed$")
        out = text(cards.apply_done(ROOT, "x", META, extra_notes=["could not archive the diff: boom"]))
        self.assertIn("review the notes", out)

    def test_apply_done_partial(self):
        out = text(cards.apply_done(ROOT, "x", dict(META, skipped=[1, 2])))
        self.assertTrue(out.startswith("! APPLY PARTIAL"))
        self.assertIn("2 of 4 files applied · 2 skipped", out)

    def test_apply_failed_strict_with_fix(self):
        plan = types.SimpleNamespace(root=ROOT, patches=[1, 2, 3],
                                     per_file={"a": ("fail", "x"), "b": ("ok", ""), "c": ("ok", "")})
        out = text(cards.apply_failed(plan, "p.diff", strict=True, fix_file="codebridge-fix.txt", fix_copied=True))
        self.assertTrue(out.startswith("✗ APPLY FAILED"))
        self.assertIn("Nothing was changed · 1 of 3 files cannot be applied", out)
        self.assertIn("strict (all-or-nothing)", out)
        self.assertRegex(out, r"(?m)^  Fix +codebridge-fix\.txt +\(copied to clipboard\)$")
        self.assertIn("Send the fix prompt", out)

    def test_apply_failed_without_fix_and_not_strict(self):
        plan = types.SimpleNamespace(root=ROOT, patches=[1], per_file={})
        out = text(cards.apply_failed(plan, "p.diff", strict=False))
        self.assertIn("Apply failed", out)
        self.assertNotIn("Fix", out)
        self.assertNotIn("strict", out)

    def test_cancelled_already_and_undo(self):
        self.assertIn("Cancelled · nothing was changed", text(cards.apply_cancelled(ROOT, "x")))
        self.assertIn("Invalid choice · Cancelled", text(cards.apply_cancelled(ROOT, "x", invalid=True)))
        self.assertTrue(text(cards.apply_already(ROOT, "x")).startswith("○ NOTHING TO DO"))
        out = text(cards.undo_done(ROOT, {"id": "r1", "touched": ["a", "b", "c"]}))
        self.assertTrue(out.startswith("✓ UNDO DONE"))
        self.assertIn("Reverted 3 files", out)


def call(*argv):
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        try:
            code = main(list(argv))
        except SystemExit as e:
            code = e.code
    return code, out.getvalue(), err.getvalue()


class CliCardTests(unittest.TestCase):
    def setUp(self):
        self.cfg = str(Path(tempfile.mkdtemp()) / "settings.json")
        self.r = make_repo({"a.txt": "one\ntwo\nthree\nfour\nfive\nsix\n"})
        self.cwd = os.getcwd()
        self.work = tempfile.mkdtemp()
        os.chdir(self.work)
        self.addCleanup(os.chdir, self.cwd)

    def diff_file(self, name="d.patch"):
        d = Path(self.work, name)
        d.write_text(make_diff(self.r, {"a.txt": "one\ntwo\n3\nfour\nfive\nsix\n"}), encoding="utf-8")
        return d

    def test_apply_then_undo_print_cards(self):
        d = self.diff_file()
        c, out, err = call("--config", self.cfg, "patch", "apply", str(d), "-r", str(self.r), "-y")
        self.assertEqual(c, 0, out + err)
        self.assertIn("APPLY DONE", out)
        self.assertIn("1 file applied", out)
        self.assertIn("Archived", out)
        self.assertIn("Undo: codebridge patch undo", out)
        c, out, err = call("--config", self.cfg, "patch", "undo", "-r", str(self.r))
        self.assertEqual(c, 0, out + err)
        self.assertIn("UNDO DONE", out)
        self.assertIn("Reverted 1 file", out)

    def test_apply_twice_reports_nothing_to_do(self):
        d = self.diff_file()
        call("--config", self.cfg, "patch", "apply", str(d), "-r", str(self.r), "-y", "--no-archive")
        c, out, err = call("--config", self.cfg, "patch", "apply", str(d), "-r", str(self.r), "-y")
        self.assertEqual(c, 0, out + err)
        self.assertIn("NOTHING TO DO", out)

    def test_failure_card_goes_to_stderr(self):
        d = self.diff_file("p.diff")
        (self.r / "a.txt").write_text("different\n")
        c, out, err = call("--config", self.cfg, "patch", "apply", str(d), "-r", str(self.r), "-y")
        self.assertEqual(c, 2)
        self.assertIn("APPLY FAILED", err)
        self.assertIn("codebridge-fix.txt", err)
        self.assertNotIn("APPLY FAILED", out)

    def test_failure_with_no_fix_has_no_fix_row(self):
        d = self.diff_file("p.diff")
        (self.r / "a.txt").write_text("different\n")
        c, out, err = call("--config", self.cfg, "patch", "apply", str(d), "-r", str(self.r), "-y", "--no-fix")
        self.assertEqual(c, 2)
        self.assertIn("APPLY FAILED", err)
        self.assertFalse(Path(self.work, "codebridge-fix.txt").exists())


if __name__ == "__main__":
    unittest.main()
