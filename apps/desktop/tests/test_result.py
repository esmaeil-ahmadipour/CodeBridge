import contextlib, io, types, unittest
import helpers  # noqa: F401  (puts src/ on sys.path)
from codebridge.ui.result import (CANCEL, ERROR, OK, WARN, FileLine, Result, emit,
                                  render, use_color, use_unicode)

FOLDER = "/home/esmaeil/Documents/GIT/CodeBridge2/apps/desktop/launchers"
RULE = "─" * 64


def export_card(status=OK, **kw):
    return Result(status, "EXPORT DONE", "CodeBridge2",
                  "77 files · 621.6 KB · ~153,549 tokens",
                  rows=[("File", "code_report_CodeBridge2.txt   (630.4 KB)"), ("Folder", FOLDER)],
                  actions=[("o", "Open file"), ("f", "Open folder"), ("Enter", "Continue")], **kw)


class ResultCardTests(unittest.TestCase):
    def test_export_card_layout(self):
        lines = render(export_card(), width=64).split("\n")
        self.assertEqual(len(lines), 8)
        self.assertEqual(len(lines[0]), 64)
        self.assertTrue(lines[0].startswith("✓ EXPORT DONE"))
        self.assertTrue(lines[0].endswith("CodeBridge2"))
        self.assertEqual(lines[1], RULE)
        self.assertEqual(lines[2], "  77 files · 621.6 KB · ~153,549 tokens")
        self.assertEqual(lines[3], "")
        self.assertRegex(lines[4], r"^  File +code_report_CodeBridge2\.txt")
        self.assertIn(FOLDER, lines[5])
        self.assertEqual(lines[4].index("code_report"), lines[5].index("/home"))
        self.assertEqual(lines[6], RULE)
        self.assertEqual(lines[7], "  [o] Open file   [f] Open folder   [Enter] Continue")

    def test_same_structure_for_every_status(self):
        outs = {s: render(export_card(s), width=64).split("\n") for s in (OK, WARN, ERROR, CANCEL)}
        for s, lines in outs.items():
            self.assertEqual(lines[2:], outs[OK][2:], s)
            self.assertEqual(len(lines[0]), 64, s)
        self.assertEqual({l[0] for l in (v[0] for v in outs.values())}, set("✓!✗○"))

    def test_file_columns_align(self):
        r = Result(WARN, "APPLY PARTIAL", "CodeBridge2", "2 of 3 files applied",
                   files=[FileLine(OK, "lib/main.dart", "M", "+12 −3"),
                          FileLine(ERROR, "pubspec.yaml", "M", "", "file not found"),
                          FileLine(OK, "old/util.dart", "D", "−40")])
        lines = render(r, width=64).split("\n")
        rows = [l for l in lines if "lib/main.dart" in l or "pubspec.yaml" in l or "old/util.dart" in l]
        self.assertEqual(len(rows), 3)
        self.assertEqual({l.index(n) for l, n in zip(rows, ("lib/main.dart", "pubspec.yaml", "old/util.dart"))}, {7})
        self.assertIn("+12 −3", rows[0])
        self.assertTrue(rows[1].endswith("file not found"))
        self.assertTrue(rows[0].lstrip().startswith("✓ M"))
        self.assertTrue(rows[1].lstrip().startswith("✗ M"))

    def test_ascii_fallback_has_no_colour_codes(self):
        r = export_card()
        r.files = [FileLine(OK, "a.py", "M", "+1 −2")]
        out = render(r, unicode=False, color=False, width=64)
        self.assertTrue(out.isascii(), out)
        self.assertNotIn("\x1b", out)
        self.assertTrue(out.startswith("[OK] EXPORT DONE"))
        self.assertIn("+ M  a.py", out)
        self.assertIn("+1 -2", out)

    def test_colour_only_when_asked(self):
        self.assertNotIn("\x1b", render(export_card(ERROR), color=False))
        self.assertIn("\x1b[1;31m", render(export_card(ERROR), color=True).split("\n")[0])
        self.assertIn("\x1b[1;32m", render(export_card(OK), color=True).split("\n")[0])

    def test_long_project_is_cut_and_header_stays_in_width(self):
        r = export_card()
        r.project = "x" * 80
        head = render(r, width=64).split("\n")[0]
        self.assertEqual(len(head), 64)
        self.assertIn("…", head)

    def test_actions_can_be_hidden_and_footer_stays(self):
        r = export_card()
        r.footer = ["Undo: codebridge patch undo"]
        out = render(r, width=64, actions=False)
        self.assertNotIn("[o]", out)
        self.assertTrue(out.endswith("  Undo: codebridge patch undo"))

    def test_card_without_body_has_one_rule(self):
        out = render(Result(CANCEL, "APPLY CANCELLED", "p"), width=64).split("\n")
        self.assertEqual(len(out), 2)

    def test_use_color_and_unicode(self):
        tty = types.SimpleNamespace(isatty=lambda: True)
        self.assertTrue(use_color(tty, {}))
        self.assertFalse(use_color(tty, {"NO_COLOR": "1"}))
        self.assertFalse(use_color(tty, {"TERM": "dumb"}))
        self.assertFalse(use_color(io.StringIO(), {}))
        self.assertFalse(use_unicode(types.SimpleNamespace(encoding="ascii")))
        self.assertTrue(use_unicode(types.SimpleNamespace(encoding="utf-8")))
        self.assertTrue(use_unicode(io.StringIO()))

    def test_emit_routes_errors_to_stderr(self):
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            emit(export_card(OK), actions=False)
            emit(export_card(ERROR), actions=False)
        self.assertEqual(out.getvalue().count("EXPORT DONE"), 1)
        self.assertEqual(err.getvalue().count("EXPORT DONE"), 1)
        self.assertTrue(out.getvalue().startswith("✓"))
        self.assertTrue(err.getvalue().startswith("✗"))


if __name__ == "__main__":
    unittest.main()
