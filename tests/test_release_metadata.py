import json
import sys
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "apps" / "desktop" / "src"))
import codebridge


class VersionMetadataTests(unittest.TestCase):
    def test_runtime_version_matches_package_version(self):
        package = json.loads((REPO / "package.json").read_text(encoding="utf-8"))
        version = package["version"]
        runtime_version = codebridge.__version__.split("-dev", 1)[0]
        self.assertEqual(runtime_version, version)

    def test_pyproject_uses_generated_version(self):
        pyproject = (REPO / "apps" / "desktop" / "pyproject.toml").read_text(encoding="utf-8")
        self.assertIn('dynamic = ["version"]', pyproject)
        self.assertIn(
            'version = { attr = "codebridge._version.__version__" }',
            pyproject,
        )


if __name__ == "__main__":
    unittest.main()
