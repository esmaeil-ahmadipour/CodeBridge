import tempfile, unittest
from pathlib import Path
from unittest import mock
import helpers  # noqa: F401  (puts src/ on sys.path)
from codebridge.core.config import export_config_from_dict, validate_export_config
from codebridge.ui.repo import pick_repo, resolve_repo
from codebridge.ui.screen import (apply_keys, error_of, initial_state, render, summary, to_export_dict)


def tmpdir() -> str:
    return tempfile.mkdtemp()


class ScreenTests(unittest.TestCase):
    def test_defaults_and_keys(self):
        d = Path(tmpdir()); (d / "pubspec.yaml").write_text("name: x")
        st = initial_state(str(d))
        self.assertEqual((st["ptype"], st["langs"]), ("flutter", ["dart"]))
        self.assertTrue(st["l"] and st["t"] and not st["s"] and not st["o"])
        self.assertIsNone(apply_keys(st, "s t o"))
        self.assertTrue(st["s"] and not st["t"] and st["o"])
        apply_keys(st, "a")
        self.assertTrue(error_of(st))
        apply_keys(st, "c")
        self.assertEqual(st["langs"], ["typescript"])
        self.assertFalse(validate_export_config(export_config_from_dict(to_export_dict(st))))

    def test_type_resets_langs_and_quit(self):
        st = initial_state(tmpdir(), {"project_type": "flutter", "languages": ["dart"]})
        apply_keys(st, "5")
        self.assertEqual((st["ptype"], st["langs"]), ("python", ["python"]))
        self.assertEqual(apply_keys(st, "q"), "quit")
        self.assertIn("[x] d python", render(st))

    def test_custom_inputs(self):
        st = initial_state(tmpdir(), {"project_type": "flutter", "languages": ["dart"]})
        answers = iter(["MyType", "Lua Zig"])
        apply_keys(st, "6x", ask=lambda _: next(answers))
        self.assertEqual(st["custom_type"], "MyType")
        self.assertEqual(st["custom_langs"], ["lua", "zig"])

    def test_saved_choices_follow_detected_type(self):
        d = Path(tmpdir()); (d / "package.json").write_text("{}")
        saved = {"project_type": "flutter", "languages": ["dart"], "include_svg": True}
        st = initial_state(str(d), saved)
        self.assertEqual((st["ptype"], st["langs"], st["s"]), ("node", ["javascript", "typescript"], True))

    def test_summary_and_box_shape(self):
        st = initial_state(tmpdir(), {"project_type": "flutter", "languages": ["dart"]})
        self.assertEqual(summary(st), "Will export: flutter · dart · no locks · no tests")
        widths = {len(x) for x in render(st).splitlines()}
        self.assertEqual(len(widths), 1, widths)  # every row of the box has the same width


class RepoPickerTests(unittest.TestCase):
    PS = [{"name": "app", "path": "/x/app"}, {"name": "site", "path": "/x/site"}]

    def test_choices(self):
        with mock.patch("builtins.print"):
            self.assertEqual(pick_repo(self.PS, "site", ask=lambda _: ""), "site")  # Enter = last used
            self.assertEqual(pick_repo(self.PS, "", ask=lambda _: ""), "app")
            self.assertEqual(pick_repo(self.PS, "", ask=lambda _: "2"), "site")
            self.assertEqual(pick_repo(self.PS, "", ask=lambda _: "app"), "app")
            d = tmpdir()
            self.assertEqual(pick_repo(self.PS, "", ask=lambda _: d), d)
            self.assertIsNone(pick_repo(self.PS, "", ask=lambda _: "q"))
            self.assertEqual(pick_repo([], "", ask=lambda _: ""), ".")

    def test_bad_path_asks_again_and_lists_one_per_line(self):
        answers = iter(["/nope/zzz", "1"])
        with mock.patch("builtins.print") as pr:
            self.assertEqual(pick_repo(self.PS, "", ask=lambda _: next(answers)), "app")
        shown = "\n".join(str(c.args[0]) for c in pr.call_args_list if c.args)
        self.assertIn("Folder not found", shown)
        self.assertIn("1  app   /x/app", shown)
        self.assertIn("2  site  /x/site", shown)

    def test_resolve(self):
        self.assertEqual(resolve_repo(self.PS, "app"), "/x/app")
        self.assertEqual(resolve_repo(self.PS, "/y"), "/y")


if __name__ == "__main__":
    unittest.main()
