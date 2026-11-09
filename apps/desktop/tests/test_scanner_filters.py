import unittest
from codebridge.core.config import ExportConfig, export_config_from_dict
from codebridge.context.scanner import apply_project_filters


class ScannerFilterTests(unittest.TestCase):
    def _cfg(self, **kw):
        base = {
            "project_type": None,
            "custom_project_type": "",
            "languages": [],
            "custom_languages": [],
            "include_svg": None,
            "exclude_lock_files": None,
            "exclude_test_files": None,
        }
        base.update(kw)
        return export_config_from_dict(base)

    def test_no_filtering_when_none(self):
        paths = ["a.svg", "package-lock.json", "src/main.py", "tests/test_a.py"]
        cfg = self._cfg()
        result = apply_project_filters(paths, cfg)
        self.assertEqual(result, paths)

    def test_exclude_svg(self):
        paths = ["a.svg", "b.png", "src/main.py"]
        cfg = self._cfg(include_svg=False)
        result = apply_project_filters(paths, cfg)
        self.assertNotIn("a.svg", result)
        self.assertIn("b.png", result)  # png not in IMAGE_EXTS for this filter (only svg)
        self.assertIn("src/main.py", result)

    def test_include_svg_keeps_all(self):
        paths = ["a.svg", "src/main.py"]
        cfg = self._cfg(include_svg=True)
        result = apply_project_filters(paths, cfg)
        self.assertIn("a.svg", result)
        self.assertIn("src/main.py", result)

    def test_flutter_excludes_pubspec_lock(self):
        paths = ["pubspec.lock", "lib/main.dart", "test/widget_test.dart"]
        cfg = self._cfg(project_type="flutter", exclude_lock_files=True)
        result = apply_project_filters(paths, cfg)
        self.assertNotIn("pubspec.lock", result)
        self.assertIn("lib/main.dart", result)

    def test_node_excludes_package_lock(self):
        paths = ["package-lock.json", "yarn.lock", "src/index.ts"]
        cfg = self._cfg(project_type="node", exclude_lock_files=True)
        result = apply_project_filters(paths, cfg)
        self.assertNotIn("package-lock.json", result)
        self.assertNotIn("yarn.lock", result)
        self.assertIn("src/index.ts", result)

    def test_python_excludes_poetry_lock(self):
        paths = ["poetry.lock", "Pipfile.lock", "src/app.py"]
        cfg = self._cfg(project_type="python", exclude_lock_files=True)
        result = apply_project_filters(paths, cfg)
        self.assertNotIn("poetry.lock", result)
        self.assertNotIn("Pipfile.lock", result)
        self.assertIn("src/app.py", result)

    def test_other_project_no_default_lock_filter(self):
        paths = ["poetry.lock", "src/main.rs"]
        cfg = self._cfg(project_type="other", custom_project_type="Rust", exclude_lock_files=True)
        result = apply_project_filters(paths, cfg)
        # "other" has no default lock rules, so poetry.lock stays
        self.assertIn("poetry.lock", result)
        self.assertIn("src/main.rs", result)

    def test_node_excludes_test_files(self):
        paths = ["src/a.test.ts", "src/a.spec.ts", "src/main.ts", "__tests__/setup.js"]
        cfg = self._cfg(project_type="node", exclude_test_files=True)
        result = apply_project_filters(paths, cfg)
        self.assertNotIn("src/a.test.ts", result)
        self.assertNotIn("src/a.spec.ts", result)
        self.assertIn("src/main.ts", result)
        self.assertNotIn("__tests__/setup.js", result)

    def test_python_excludes_test_files(self):
        paths = ["src/app.py", "tests/test_app.py", "tests/conftest.py", "src/_helper.py"]
        cfg = self._cfg(project_type="python", exclude_test_files=True)
        result = apply_project_filters(paths, cfg)
        self.assertIn("src/app.py", result)
        self.assertNotIn("tests/test_app.py", result)
        self.assertNotIn("tests/conftest.py", result)
        self.assertIn("src/_helper.py", result)

    def test_flutter_excludes_test_dart(self):
        paths = ["lib/main.dart", "test/widget_test.dart", "integration_test/app_test.dart"]
        cfg = self._cfg(project_type="flutter", exclude_test_files=True)
        result = apply_project_filters(paths, cfg)
        self.assertIn("lib/main.dart", result)
        self.assertNotIn("test/widget_test.dart", result)
        self.assertNotIn("integration_test/app_test.dart", result)

    def test_exclude_test_false_keeps_tests(self):
        paths = ["src/a.test.ts", "src/main.ts"]
        cfg = self._cfg(project_type="node", exclude_test_files=False)
        result = apply_project_filters(paths, cfg)
        self.assertIn("src/a.test.ts", result)
        self.assertIn("src/main.ts", result)

    def test_combined_filters(self):
        paths = [
            "pubspec.lock", "lib/main.dart", "test/widget_test.dart",
            "assets/icon.svg", "src/utils.dart",
        ]
        cfg = self._cfg(
            project_type="flutter",
            include_svg=False,
            exclude_lock_files=True,
            exclude_test_files=True,
        )
        result = apply_project_filters(paths, cfg)
        self.assertNotIn("pubspec.lock", result)
        self.assertNotIn("test/widget_test.dart", result)
        self.assertNotIn("assets/icon.svg", result)
        self.assertIn("lib/main.dart", result)
        self.assertIn("src/utils.dart", result)


if __name__ == "__main__":
    unittest.main()
