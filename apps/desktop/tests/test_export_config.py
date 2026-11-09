import unittest
from codebridge.core.config import (ExportConfig, validate_export_config,
                                    export_config_from_dict, export_config_to_dict,
                                    default_export_config, LOCK_FILES_BY_PROJECT,
                                    TEST_RULES_BY_PROJECT, migrate, default_settings)


class ExportConfigTests(unittest.TestCase):
    def test_default_config_none_answers(self):
        cfg = default_export_config()
        self.assertIsNone(cfg.project_type)
        self.assertIsNone(cfg.include_svg)
        self.assertIsNone(cfg.exclude_lock_files)
        self.assertIsNone(cfg.exclude_test_files)
        self.assertEqual(cfg.languages, frozenset())
        self.assertTrue(cfg.redact_secrets)

    def test_validate_valid_config(self):
        cfg = ExportConfig(
            project_type="flutter",
            languages=frozenset(["dart"]),
            include_svg=False,
            exclude_lock_files=True,
            exclude_test_files=True,
        )
        self.assertEqual(validate_export_config(cfg), [])

    def test_validate_invalid_project_type(self):
        cfg = ExportConfig(project_type="not-a-real-type", languages=frozenset(["python"]))
        errors = validate_export_config(cfg)
        self.assertTrue(any("project_type" in e for e in errors))

    def test_validate_other_requires_custom(self):
        cfg = ExportConfig(project_type="other", custom_project_type="", languages=frozenset(["python"]))
        errors = validate_export_config(cfg)
        self.assertTrue(any("custom_project_type" in e for e in errors))

    def test_validate_other_with_custom_ok(self):
        cfg = ExportConfig(project_type="other", custom_project_type="Rust", languages=frozenset(["rust"]))
        self.assertEqual(validate_export_config(cfg), [])

    def test_validate_no_languages(self):
        cfg = ExportConfig(project_type="python", languages=frozenset())
        errors = validate_export_config(cfg)
        self.assertTrue(any("language" in e.lower() for e in errors))

    def test_serialize_roundtrip(self):
        cfg = ExportConfig(
            project_type="python",
            custom_project_type="",
            languages=frozenset(["python", "go"]),
            custom_languages=frozenset(["rust"]),
            include_svg=False,
            exclude_lock_files=True,
            exclude_test_files=False,
        )
        d = export_config_to_dict(cfg)
        cfg2 = export_config_from_dict(d)
        self.assertEqual(cfg.project_type, cfg2.project_type)
        self.assertEqual(cfg.languages, cfg2.languages)
        self.assertEqual(cfg.custom_languages, cfg2.custom_languages)
        self.assertEqual(cfg.include_svg, cfg2.include_svg)
        self.assertEqual(cfg.exclude_lock_files, cfg2.exclude_lock_files)
        self.assertEqual(cfg.exclude_test_files, cfg2.exclude_test_files)

    def test_serialize_none_values(self):
        d = export_config_to_dict(default_export_config())
        self.assertIsNone(d["project_type"])
        self.assertIsNone(d["include_svg"])
        self.assertIsNone(d["exclude_lock_files"])
        self.assertIsNone(d["exclude_test_files"])
        self.assertEqual(d["languages"], [])
        self.assertEqual(d["custom_languages"], [])

    def test_from_dict_missing_keys(self):
        cfg = export_config_from_dict({})
        self.assertIsNone(cfg.project_type)
        self.assertIsNone(cfg.include_svg)
        self.assertTrue(cfg.redact_secrets)

    def test_from_dict_forces_redact_secrets(self):
        cfg = export_config_from_dict({"redact_secrets": False})
        self.assertTrue(cfg.redact_secrets)

    def test_migrate_preserves_export_section(self):
        raw = {
            "version": 3,
            "defaults": {},
            "patch": {},
            "projects": [],
            "export": {
                "project_type": "flutter",
                "languages": ["dart"],
                "include_svg": False,
            },
        }
        s = migrate(raw)
        self.assertEqual(s["export"]["project_type"], "flutter")
        self.assertEqual(s["export"]["languages"], ["dart"])
        self.assertFalse(s["export"]["include_svg"])

    def test_migrate_forces_redact_secrets_true(self):
        raw = {
            "version": 3,
            "defaults": {"redact_secrets": False},
            "patch": {},
            "projects": [],
        }
        s = migrate(raw)
        self.assertTrue(s["defaults"]["redact_secrets"])

    def test_default_settings_has_export_none(self):
        s = default_settings()
        self.assertIsNone(s["export"])

    def test_lock_files_by_project(self):
        self.assertIn("pubspec.lock", LOCK_FILES_BY_PROJECT["flutter"])
        self.assertIn("package-lock.json", LOCK_FILES_BY_PROJECT["node"])
        self.assertIn("poetry.lock", LOCK_FILES_BY_PROJECT["python"])
        self.assertIn("Cargo.lock", LOCK_FILES_BY_PROJECT["rust"])

    def test_test_rules_by_project(self):
        self.assertIn("_test.dart", TEST_RULES_BY_PROJECT["flutter"]["files"])
        self.assertIn("test_", TEST_RULES_BY_PROJECT["python"]["files"])
        self.assertIn("conftest.py", TEST_RULES_BY_PROJECT["python"]["files"])


if __name__ == "__main__":
    unittest.main()
