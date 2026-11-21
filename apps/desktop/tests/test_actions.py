import builtins, io, tempfile, types, unittest
from pathlib import Path
from unittest import mock
import helpers  # noqa: F401
from codebridge.ui import cards, opener, result
from codebridge.ui.result import OK, Result, emit


def card(**kw):
    return Result(OK, "EXPORT DONE", "p", "1 file", actions=[("o", "Open file"), ("f", "Open folder"), ("Enter", "Continue")],
                  open={"o": "/r/a.txt", "f": "/r"}, **kw)


def run_emit(keys, opener_result=None, **kw):
    out = io.StringIO()
    feed = iter(keys)

    def fake_input(_prompt=""):
        v = next(feed)
        if isinstance(v, BaseException):
            raise v
        return v

    with mock.patch.object(builtins, "input", fake_input), \
            mock.patch("codebridge.ui.opener.open_path", return_value=opener_result) as op:
        emit(card(**kw), out, actions=True)
    return out.getvalue(), op


class OpenerTests(unittest.TestCase):
    def setUp(self):
        self.f = Path(tempfile.mkdtemp(), "a.txt")
        self.f.write_text("x")

    def test_linux_uses_xdg_open(self):
        with mock.patch("sys.platform", "linux"), mock.patch("subprocess.Popen") as p:
            self.assertIsNone(opener.open_path(self.f))
        self.assertEqual(p.call_args[0][0], ["xdg-open", str(self.f)])

    def test_macos_uses_open(self):
        with mock.patch("sys.platform", "darwin"), mock.patch("subprocess.Popen") as p:
            self.assertIsNone(opener.open_path(self.f.parent))
        self.assertEqual(p.call_args[0][0], ["open", str(self.f.parent)])

    def test_windows_uses_startfile(self):
        with mock.patch("sys.platform", "win32"), mock.patch("os.startfile", create=True) as sf:
            self.assertIsNone(opener.open_path(self.f))
        sf.assert_called_once_with(str(self.f))

    def test_missing_path_and_launcher_errors_are_returned_not_raised(self):
        self.assertIn("not found", opener.open_path(self.f.parent / "nope"))
        with mock.patch("sys.platform", "linux"), mock.patch("subprocess.Popen", side_effect=FileNotFoundError("xdg-open")):
            self.assertIn("xdg-open", opener.open_path(self.f))


class PromptTests(unittest.TestCase):
    def test_key_line_is_shown_and_keys_open_the_right_paths(self):
        out, op = run_emit(["o", "f", ""])
        self.assertIn("[o] Open file   [f] Open folder   [Enter] Continue", out)
        self.assertEqual([c.args[0] for c in op.call_args_list], ["/r/a.txt", "/r"])
        self.assertEqual(out.count("Opened."), 2)

    def test_enter_unknown_key_and_eof_all_continue_without_opening(self):
        for keys in ([""], ["zzz"], [EOFError()], [KeyboardInterrupt()]):
            out, op = run_emit(keys)
            op.assert_not_called()

    def test_open_failure_is_reported_and_prompt_continues(self):
        out, op = run_emit(["o", ""], opener_result="boom")
        self.assertIn("! Could not open: boom", out)
        self.assertEqual(op.call_count, 1)

    def test_no_prompt_without_actions_or_without_open_targets(self):
        with mock.patch.object(builtins, "input", side_effect=AssertionError("must not ask")):
            out = io.StringIO()
            emit(card(), out, actions=False)
            self.assertNotIn("[o]", out.getvalue())
            emit(Result(OK, "T", "p", "s", actions=[("Enter", "Continue")]), io.StringIO(), actions=True)

    def test_prompted_flag(self):
        result.reset_prompted()
        self.assertFalse(result.was_prompted())
        run_emit([""])
        self.assertTrue(result.was_prompted())
        result.reset_prompted()
        self.assertFalse(result.was_prompted())


class CardActionTests(unittest.TestCase):
    def test_export_done_can_open_file_and_folder(self):
        r = cards.export_done("p", "/x", {"files": 1, "outs": ["/r/code_report_p.txt"], "tokens": 1, "bytes": 1,
                                          "sizes": [1], "clipboard": None})
        self.assertEqual(r.open, {"o": "/r/code_report_p.txt", "f": "/r"})
        self.assertEqual([k for k, _ in r.actions], ["o", "f", "Enter"])

    def test_missing_folder_offers_no_open_action(self):
        r = cards.export_failed("p", "/definitely/not/here", "boom")
        self.assertEqual(r.open, {})
        self.assertEqual(r.actions, [])

    def test_existing_folder_is_offered(self):
        d = tempfile.mkdtemp()
        self.assertEqual(cards.export_empty("p", d).open, {"f": d})
        self.assertEqual(cards.undo_done(d, {"id": "r", "touched": []}).open, {"f": d})
        self.assertEqual(cards.apply_done(d, "x", {"id": "r", "files": [], "skipped": [], "notes": []}).open, {"f": d})

    def test_failed_apply_offers_fix_prompt_and_repo(self):
        d = tempfile.mkdtemp()
        plan = types.SimpleNamespace(root=d, patches=[1], per_file={})
        r = cards.apply_failed(plan, "x", strict=True, fix_file="codebridge-fix.txt", fix_copied=True)
        self.assertEqual(r.open["f"], d)
        self.assertEqual(Path(r.open["x"]).name, "codebridge-fix.txt")
        self.assertEqual([k for k, _ in r.actions], ["x", "f", "Enter"])
        self.assertNotIn("x", cards.apply_failed(plan, "x", fix_file=None).open)

    def test_other_cards_have_no_open_targets(self):
        self.assertEqual(cards.apply_cancelled("/r", "x").open, {})
        self.assertEqual(cards.apply_already("/r", "x").open, {})


class MenuPauseTests(unittest.TestCase):
    def test_no_second_pause_when_the_card_already_waited(self):
        from codebridge.ui import menu

        def fake_main(_argv):
            result._state["prompted"] = True
            return 0

        with mock.patch("codebridge.cli.main", fake_main), \
                mock.patch.object(builtins, "input", side_effect=AssertionError("double pause")):
            menu._call("cfg", "patch", "apply")

    def test_pause_remains_when_nothing_prompted(self):
        from codebridge.ui import menu
        with mock.patch("codebridge.cli.main", lambda _a: 0), \
                mock.patch.object(builtins, "input", return_value="") as inp:
            menu._call("cfg", "history")
        inp.assert_called_once()


if __name__ == "__main__":
    unittest.main()
