import contextlib, io, os, tempfile, unittest
from pathlib import Path
import helpers
from helpers import make_repo
from codebridge.cli import main
from codebridge.core.config import export_config_from_dict, export_extensions, load_settings, save_settings


class ExportExtensionsTests(unittest.TestCase):
    def test_languages_become_extensions(self):
        e = export_extensions(export_config_from_dict({"languages": ["typescript", "python"]}))
        for x in (".py", ".ts", ".tsx", ".md", ".json"):
            self.assertIn(x, e)
        self.assertNotIn(".dart", e)

    def test_no_language_means_all_types(self):
        self.assertEqual(export_extensions(export_config_from_dict({})), [])

    def test_custom_language(self):
        e = export_extensions(export_config_from_dict({"languages": ["python"], "custom_languages": ["Scala"]}))
        self.assertIn(".scala", e)

    def test_chosen_languages_override_project_preset(self):
        repo = make_repo({"m.py": "x=1\n", "a.ts": "let a = 1;\n"})
        work = tempfile.mkdtemp()
        cfg = os.path.join(work, "settings.json")
        old = os.getcwd()
        os.chdir(work)
        self.addCleanup(os.chdir, old)
        with contextlib.redirect_stdout(io.StringIO()):
            main(["--config", cfg, "project", "add", str(repo), "-n", "demo", "--preset", "node"])
            s = load_settings(cfg, quiet=True)
            s["export"] = {"project_type": "python", "languages": ["python", "typescript"]}
            save_settings(s, cfg)
            main(["--config", cfg, "context", "export", "-p", "demo", "--no-backup"])
        rep = Path(work, "code_report_demo.txt").read_text(encoding="utf-8")
        self.assertIn("FILE:  m.py", rep)
        self.assertIn("FILE:  a.ts", rep)


if __name__ == "__main__":
    unittest.main()
