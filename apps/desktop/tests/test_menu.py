import contextlib, io, os, re, tempfile, unittest
from pathlib import Path
from unittest import mock
import helpers
from helpers import make_repo, make_diff
import codebridge
from codebridge.core.config import load_settings, save_settings
from codebridge.ui import menu


def run(cfg, inputs, clipboard=None):
    out = io.StringIO()
    it = iter(inputs)
    with mock.patch("builtins.input", lambda *_: next(it)), contextlib.redirect_stdout(out), \
            mock.patch("codebridge.cli.from_clipboard", return_value=clipboard):
        code = menu.run_menu(cfg)
    return code, out.getvalue()



class MenuTests(unittest.TestCase):
    def setUp(self):
        self.work = tempfile.mkdtemp()
        self.cfg = os.path.join(self.work, "settings.json")
        self.old = os.getcwd(); os.chdir(self.work)
        self.addCleanup(os.chdir, self.old)

    def test_main_menu_one_item_per_line(self):
        code, out = run(self.cfg, ["0"])
        self.assertEqual(code, 0)
        for n in "1234560":
            self.assertEqual(len(re.findall(rf"^│  {n}  ", out, re.M)), 1, n)
        self.assertIn(f"CodeBridge {codebridge.__version__}", out)

    def test_export_from_one_screen(self):
        r = make_repo({"pubspec.yaml": "name: x\n", "lib/main.dart": "void main() {}\n"})
        code, out = run(self.cfg, ["1", "p", str(r), "", "0"])
        self.assertEqual(code, 0, out)
        self.assertTrue(list(Path(self.work).glob("code_report_*.txt")), out)
        s = load_settings(self.cfg, quiet=True)
        self.assertEqual(s["last_project"], str(r))
        self.assertEqual(s["export"]["project_type"], "flutter")
        self.assertNotIn("Press Enter to continue", out)

    def test_apply_from_clipboard_and_undo_use_repo_list(self):
        r = make_repo({"a.txt": "one\ntwo\n"})
        diff = make_diff(r, {"a.txt": "one\ntwo\nthree\n"})
        s = load_settings(self.cfg, quiet=True)
        s["projects"] = [{"name": "demo", "path": str(r), "active": True, "overrides": {}}]
        s["patch"]["confirm_before_apply"] = False
        save_settings(s, self.cfg)
        code, out = run(self.cfg, ["2", "", "", "", "0"], clipboard=diff)   # Enter = demo, Enter = copied, Enter = continue
        self.assertEqual(code, 0, out)
        self.assertIn("Do NOT paste it here", out)
        self.assertIn("1  demo", out)
        self.assertEqual((r / "a.txt").read_text(), "one\ntwo\nthree\n")
        self.assertEqual(load_settings(self.cfg, quiet=True)["last_project"], "demo")
        run(self.cfg, ["3", "", "", "0"])
        self.assertEqual((r / "a.txt").read_text(), "one\ntwo\n")

    def test_last_project_survives_settings_migration(self):
        s = load_settings(self.cfg, quiet=True)
        s["last_project"] = "demo"
        save_settings(s, self.cfg)
        self.assertEqual(load_settings(self.cfg, quiet=True)["last_project"], "demo")


if __name__ == "__main__":
    unittest.main()
