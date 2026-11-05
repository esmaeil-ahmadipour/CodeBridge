import unittest
from pathlib import Path
import helpers
from helpers import make_repo, sh
from codebridge.core.config import default_settings
from codebridge.context.scanner import collect, changed_files
from codebridge.context.exporter import build_report, redact, export_project


def opts(**kw):
    o = default_settings()["defaults"]
    o.update(kw)
    return o


class T(unittest.TestCase):
    def setUp(self):
        self.r = make_repo({"a.py": "print(1)\n", "b.md": "# hi\n", "node_modules/x.js": "x",
                            "sub/c.txt": "c\n", ".gitignore": "ignored.txt\n"})
        (self.r / "ignored.txt").write_text("no")
        (self.r / "bin.dat").write_bytes(b"\x00\x01\x02")

    def names(self, **kw):
        return [f[0] for f in collect(self.r, opts(**kw))]

    def test_all_types_and_gitignore(self):
        n = self.names()
        self.assertIn("a.py", n); self.assertIn("sub/c.txt", n); self.assertIn(".gitignore", n)
        self.assertNotIn("ignored.txt", n); self.assertNotIn("bin.dat", n)
        self.assertNotIn("node_modules/x.js", n)

    def test_extension_filter(self):
        self.assertEqual(self.names(only_extensions=[".md"]), ["b.md"])

    def test_no_git_fallback(self):
        import tempfile
        d = Path(tempfile.mkdtemp())
        (d / "k.py").write_text("1"); (d / ".gitignore").write_text("*.log\n"); (d / "x.log").write_text("l")
        n = [f[0] for f in collect(d, opts())]
        self.assertIn("k.py", n); self.assertNotIn("x.log", n)

    def test_changed_and_since(self):
        (self.r / "a.py").write_text("print(2)\n")
        (self.r / "new.txt").write_text("n")
        self.assertEqual(changed_files(self.r), ["a.py", "bin.dat", "new.txt"])
        got = [f[0] for f in collect(self.r, opts(), only=changed_files(self.r))]
        self.assertEqual(got, ["a.py", "new.txt"])
        sh(self.r, "git", "add", "-A"); sh(self.r, "git", "commit", "-q", "-m", "2")
        self.assertEqual(changed_files(self.r, "HEAD~1"), ["a.py", "bin.dat", "new.txt"])

    def test_redact_and_header(self):
        t, n = redact('api_key = "abcdefgh12345678"\nAKIAABCDEFGHIJKLMNOP\n')
        self.assertEqual(n, 2); self.assertNotIn("abcdefgh", t)
        rep = build_report("p", "/abs/path", [("a.py", 5, 'token="supersecret99"')], opts())[0]
        self.assertIn("INSTRUCTIONS FOR THE AI", rep)
        self.assertNotIn("/abs/path", rep); self.assertNotIn("supersecret99", rep)
        self.assertIn("REDACTED: 1", rep)

    def test_split(self):
        files = [(f"f{i}.txt", 400, "x" * 400) for i in range(6)]
        parts = build_report("p", "r", files, opts(split_tokens=250))
        self.assertGreater(len(parts), 1)
        self.assertTrue(all("FILE:" in p for p in parts))

    def test_export_writes_and_excludes_own_output(self):
        import tempfile, os
        out = Path(tempfile.mkdtemp())
        o = opts(backup={"keep": True, "compress": False, "days": 30})
        r = export_project("proj", self.r, o, outdir=out, say=lambda *_: None)
        self.assertEqual(len(r["outs"]), 1)
        self.assertTrue((out / "backup").is_dir())
        self.assertIn("a.py", Path(r["outs"][0]).read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
