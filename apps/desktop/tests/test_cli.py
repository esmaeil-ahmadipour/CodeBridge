import contextlib, io, os, tempfile, unittest
from pathlib import Path
import helpers
from helpers import make_repo, make_diff
from codebridge.cli import main


def call(*argv):
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        try:
            code = main(list(argv))
        except SystemExit as e:
            code = e.code
    return code, out.getvalue(), err.getvalue()


class T(unittest.TestCase):
    def setUp(self):
        self.cfg = str(Path(tempfile.mkdtemp()) / "settings.json")
        self.r = make_repo({"a.txt": "one\ntwo\nthree\nfour\nfive\nsix\n", "m.py": "x=1\n"})
        self.cwd = os.getcwd()
        self.work = tempfile.mkdtemp()
        os.chdir(self.work)

    def tearDown(self):
        os.chdir(self.cwd)

    def test_version(self):
        self.assertEqual(call("--version")[0], 0)

    def test_context_export_changed(self):
        (self.r / "m.py").write_text("x=2\n")
        c, out, _ = call("--config", self.cfg, "context", "export", str(self.r), "--changed", "--no-backup")
        self.assertEqual(c, 0)
        rep = Path(self.work, f"code_report_{self.r.name}.txt").read_text(encoding="utf-8")
        self.assertIn("m.py", rep); self.assertNotIn("FILE:  a.txt", rep)

    def test_patch_full_cycle(self):
        diff = make_diff(self.r, {"a.txt": "one\ntwo\n3\nfour\nfive\nsix\n"})
        d = Path(self.work, "diff.patch"); d.write_text(diff, encoding="utf-8")
        c, out, err = call("--config", self.cfg, "patch", "check", str(d), "-r", str(self.r))
        self.assertEqual(c, 0, out + err)
        c, out, err = call("--config", self.cfg, "patch", "apply", str(d), "-r", str(self.r), "-y")
        self.assertEqual(c, 0, out + err)
        self.assertIn("3", (self.r / "a.txt").read_text())
        self.assertFalse(d.exists()); self.assertTrue(list(Path(self.work).glob("diff.patch.applied-*")))
        c, out, _ = call("--config", self.cfg, "history")
        self.assertIn("patch", out)
        c, out, err = call("--config", self.cfg, "patch", "undo", "-r", str(self.r))
        self.assertEqual(c, 0, err); self.assertIn("two\nthree", (self.r / "a.txt").read_text())

    def test_failure_writes_fix_prompt(self):
        diff = make_diff(self.r, {"a.txt": "one\ntwo\n3\nfour\nfive\nsix\n"})
        (self.r / "a.txt").write_text("different\n")
        d = Path(self.work, "p.diff"); d.write_text(diff, encoding="utf-8")
        c, out, err = call("--config", self.cfg, "patch", "apply", str(d), "-r", str(self.r), "-y")
        self.assertEqual(c, 2)
        self.assertIn("FIX REQUEST", Path(self.work, "codebridge-fix.txt").read_text(encoding="utf-8"))
        self.assertEqual((self.r / "a.txt").read_text(), "different\n")

    def test_not_a_repo_and_missing_diff(self):
        c, _, err = call("--config", self.cfg, "patch", "check", "nope.diff", "-r", self.work)
        self.assertEqual(c, 1)

    def test_project_registry(self):
        self.assertEqual(call("--config", self.cfg, "project", "add", str(self.r), "-n", "demo", "--preset", "python")[0], 0)
        c, out, _ = call("--config", self.cfg, "project", "list")
        self.assertIn("demo", out)
        c, out, _ = call("--config", self.cfg, "context", "preview", "-p", "demo")
        self.assertEqual(c, 0); self.assertIn("m.py", out)
        self.assertEqual(call("--config", self.cfg, "project", "remove", "demo")[0], 0)


if __name__ == "__main__":
    unittest.main()
