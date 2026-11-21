import contextlib, io, os, tempfile, types, unittest
from pathlib import Path
import helpers
from helpers import make_repo, make_diff
from codebridge.cli import main
from codebridge.ui import cards
from codebridge.ui.result import FileLine, OK, Result, render

ROOT = "/home/u/GIT/CodeBridge2"


def fp(name, kind="MOD", added=1, removed=2):
    return types.SimpleNamespace(name=name, kind=kind, added=added, removed=removed)


def plan(status, patches, per_file=None, flags=(), error=""):
    return types.SimpleNamespace(root=ROOT, status=status, patches=patches,
                                 per_file=per_file or {}, flags=list(flags), error=error)


def text(card):
    return render(card, width=64)


class PlanCardTests(unittest.TestCase):
    def test_ok_plan_lists_every_file(self):
        p = plan("apply", [fp("lib/a.dart", "MOD", 12, 3), fp("lib/b.dart", "ADD", 88, 0)])
        out = text(cards.patch_plan(p, "clipboard", "check"))
        lines = out.split("\n")
        self.assertTrue(lines[0].startswith("✓ PATCH CHECK"))
        self.assertIn("2 files can be applied", out)
        self.assertRegex(out, r"(?m)^  ✓ MOD  lib/a\.dart +\+12 −3$")
        self.assertRegex(out, r"(?m)^  ✓ ADD  lib/b\.dart +\+88 −0$")
        self.assertNotRegex(out, r"(?m)^  Mode ")

    def test_titles_follow_the_mode(self):
        p = plan("apply", [fp("a")])
        for mode, title in (("check", "PATCH CHECK"), ("preview", "PATCH PREVIEW"), ("apply", "APPLY PLAN")):
            self.assertIn(title, text(cards.patch_plan(p, "x", mode)).split("\n")[0])

    def test_tolerant_plan_is_a_warning(self):
        p = plan("apply", [fp("a")], flags=["--recount"])
        out = text(cards.patch_plan(p, "x", "apply"))
        self.assertTrue(out.startswith("! APPLY PLAN"))
        self.assertIn("tolerant (--recount)", out)

    def test_failed_file_shows_reason_under_it(self):
        pf = {"a": ("fail", "error: patch failed: a:2\nerror: a: patch does not apply"), "b": ("ok", "")}
        out = text(cards.patch_plan(plan("fail", [fp("a"), fp("b")], pf), "x", "check"))
        self.assertTrue(out.startswith("✗ PATCH CHECK"))
        self.assertIn("1 of 2 files cannot be applied", out)
        self.assertRegex(out, r"(?m)^  ✗ MOD  a +\+1 −2  cannot apply$")
        self.assertRegex(out, r"(?m)^      error: patch failed: a:2$")
        self.assertRegex(out, r"(?m)^      error: a: patch does not apply$")
        self.assertRegex(out, r"(?m)^  ✓ MOD  b ")

    def test_partial_apply_is_a_warning_not_an_error(self):
        pf = {"a": ("fail", "x"), "b": ("ok", "")}
        out = text(cards.patch_plan(plan("fail", [fp("a"), fp("b")], pf), "x", "apply", partial=True))
        self.assertTrue(out.startswith("! APPLY PLAN"))
        self.assertIn("they will be skipped", out)
        out = text(cards.patch_plan(plan("fail", [fp("a"), fp("b")], pf), "x", "check", partial=True))
        self.assertTrue(out.startswith("✗ PATCH CHECK"))

    def test_error_without_failed_file_goes_to_a_row(self):
        out = text(cards.patch_plan(plan("fail", [fp("a")], {}, error="bad diff\nline 2"), "x", "check"))
        self.assertIn("Cannot be applied", out)
        self.assertRegex(out, r"(?m)^  Error +bad diff$")
        self.assertRegex(out, r"(?m)^  +line 2$")

    def test_already_applied_plan(self):
        p = plan("already", [fp("a")], {"a": ("already", "")})
        out = text(cards.patch_plan(p, "x", "check"))
        self.assertTrue(out.startswith("○ PATCH CHECK"))
        self.assertIn("Already applied · nothing to do", out)
        self.assertRegex(out, r"(?m)^  ○ MOD  a +\+1 −2  already applied$")

    def test_detail_lines_render_dim_and_indented(self):
        r = Result(OK, "T", "p", files=[FileLine(OK, "a", "M", "", "", ["why"])])
        self.assertIn("\n      why", render(r, width=64))
        self.assertIn("\x1b[90m", render(r, color=True, width=64))


def call(*argv):
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        try:
            code = main(list(argv))
        except SystemExit as e:
            code = e.code
    return code, out.getvalue(), err.getvalue()


class CliPlanTests(unittest.TestCase):
    def setUp(self):
        self.cfg = str(Path(tempfile.mkdtemp()) / "settings.json")
        self.r = make_repo({"a.txt": "one\ntwo\nthree\nfour\nfive\nsix\n"})
        self.cwd = os.getcwd()
        self.work = tempfile.mkdtemp()
        os.chdir(self.work)
        self.addCleanup(os.chdir, self.cwd)
        self.d = Path(self.work, "d.patch")
        self.d.write_text(make_diff(self.r, {"a.txt": "one\ntwo\n3\nfour\nfive\nsix\n"}), encoding="utf-8")

    def test_check_prints_plan_card_and_keeps_exit_code(self):
        c, out, err = call("--config", self.cfg, "patch", "check", str(self.d), "-r", str(self.r))
        self.assertEqual(c, 0, out + err)
        self.assertIn("PATCH CHECK", out)
        self.assertIn("1 file can be applied", out)
        self.assertRegex(out, r"(?m)^  ✓ MOD  a\.txt")
        self.assertNotIn("OK: the diff can be applied", out)

    def test_preview_diff_still_prints_the_diff(self):
        c, out, err = call("--config", self.cfg, "patch", "preview", str(self.d), "-r", str(self.r), "--diff")
        self.assertEqual(c, 0, out + err)
        self.assertIn("PATCH PREVIEW", out)
        self.assertIn("diff --git", out)

    def test_failing_check_is_exit_2_with_the_card_on_stdout(self):
        (self.r / "a.txt").write_text("different\n")
        c, out, err = call("--config", self.cfg, "patch", "check", str(self.d), "-r", str(self.r))
        self.assertEqual(c, 2)
        self.assertIn("PATCH CHECK", out)
        self.assertIn("cannot be applied", out)
        self.assertRegex(out, r"(?m)^  ✗ MOD  a\.txt")

    def test_apply_shows_plan_then_result(self):
        c, out, err = call("--config", self.cfg, "patch", "apply", str(self.d), "-r", str(self.r), "-y")
        self.assertEqual(c, 0, out + err)
        self.assertLess(out.index("APPLY PLAN"), out.index("APPLY DONE"))


if __name__ == "__main__":
    unittest.main()
