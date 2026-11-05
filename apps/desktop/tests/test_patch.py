import json, unittest
from pathlib import Path
import helpers
from helpers import make_repo, make_diff, sh
from codebridge.core.util import CBError
from codebridge.patch import engine
from codebridge.patch.parser import clean_diff, split_patches
from codebridge.patch.fix import build_fix_prompt
from codebridge.core.config import default_settings

A = "".join(f"line {i}\n" for i in range(1, 21))
A2 = A.replace("line 10\n", "line TEN\nextra\n")


def plan_of(repo, diff):
    return engine.analyze(str(repo), clean_diff(diff))


class T(unittest.TestCase):
    def setUp(self):
        self.r = make_repo({"a.txt": A, "b.txt": "b1\nb2\n", "d/old.txt": "old\n"})

    def read(self, n):
        return (self.r / n).read_text(encoding="utf-8")

    def test_apply_and_undo(self):
        diff = make_diff(self.r, {"a.txt": A2, "new/n.txt": "hello\n"})
        pl = plan_of(self.r, diff)
        self.assertEqual(pl.status, "apply")
        meta = engine.apply_plan(pl)
        self.assertEqual(self.read("a.txt"), A2); self.assertTrue((self.r / "new/n.txt").is_file())
        engine.undo(str(self.r))
        self.assertEqual(self.read("a.txt"), A); self.assertFalse((self.r / "new").exists())

    def test_already_applied(self):
        diff = make_diff(self.r, {"a.txt": A2})
        engine.apply_plan(plan_of(self.r, diff))
        self.assertEqual(plan_of(self.r, diff).status, "already")

    def test_delete_and_rename(self):
        diff = make_diff(self.r, {"b.txt": None})
        engine.apply_plan(plan_of(self.r, diff))
        self.assertFalse((self.r / "b.txt").exists())
        engine.undo(str(self.r)); self.assertEqual(self.read("b.txt"), "b1\nb2\n")
        sh(self.r, "git", "mv", "d/old.txt", "d/renamed.txt")
        d2 = sh(self.r, "git", "diff", "--cached", "-M"); sh(self.r, "git", "reset", "-q", "--hard")
        pl = plan_of(self.r, d2)
        self.assertEqual(pl.patches[0].kind, "REN")
        engine.apply_plan(pl)
        self.assertTrue((self.r / "d/renamed.txt").is_file()); self.assertFalse((self.r / "d/old.txt").exists())
        engine.undo(str(self.r)); self.assertTrue((self.r / "d/old.txt").is_file())
        self.assertFalse((self.r / "d/renamed.txt").exists())

    def test_prose_and_fence_and_crlf(self):
        diff = make_diff(self.r, {"a.txt": A2})
        reply = "Sure! Here you go:\r\n\r\n```diff\r\n" + diff.replace("\n", "\r\n") + "```\r\n\r\nHope it helps.\r\n"
        pl = plan_of(self.r, reply)
        self.assertEqual(pl.status, "apply")

    def test_prose_without_fence(self):
        diff = make_diff(self.r, {"a.txt": A2})
        pl = plan_of(self.r, "Here is the change\n\n" + diff)
        self.assertEqual(pl.status, "apply")

    def test_stripped_blank_context_lines(self):
        base = "a\n\nb\n"
        r = make_repo({"s.txt": base})
        diff = make_diff(r, {"s.txt": "a\n\nB\n"})
        diff = diff.replace("\n \n", "\n\n")          # editor stripped the lone space
        self.assertEqual(plan_of(r, diff).status, "apply")

    def test_wrong_hunk_counts_use_recount(self):
        diff = make_diff(self.r, {"a.txt": A2})
        bad = diff.replace("@@ -7,7 +7,8 @@", "@@ -7,5 +7,5 @@")
        self.assertNotEqual(bad, diff)
        pl = plan_of(self.r, bad)
        self.assertEqual(pl.status, "apply"); self.assertIn("--recount", pl.flags)
        engine.apply_plan(pl); self.assertEqual(self.read("a.txt"), A2)

    def test_strict_is_atomic(self):
        diff = make_diff(self.r, {"a.txt": A2, "b.txt": "b1\nB2\n"})
        (self.r / "b.txt").write_text("totally different\n")
        pl = plan_of(self.r, diff)
        self.assertEqual(pl.status, "fail")
        self.assertEqual(pl.per_file["a.txt"][0], "ok"); self.assertEqual(pl.per_file["b.txt"][0], "fail")
        with self.assertRaises(CBError) as e:
            engine.apply_plan(pl)
        self.assertEqual(e.exception.code, 2)
        self.assertEqual(self.read("a.txt"), A)           # nothing changed
        self.assertEqual(engine.list_runs(str(self.r)), [])

    def test_partial(self):
        diff = make_diff(self.r, {"a.txt": A2, "b.txt": "b1\nB2\n"})
        (self.r / "b.txt").write_text("totally different\n")
        meta = engine.apply_plan(plan_of(self.r, diff), partial=True)
        self.assertEqual(self.read("a.txt"), A2); self.assertEqual(meta["skipped"], ["b.txt"])
        engine.undo(str(self.r)); self.assertEqual(self.read("a.txt"), A)

    def test_undo_refuses_after_later_edit_unless_forced(self):
        engine.apply_plan(plan_of(self.r, make_diff(self.r, {"a.txt": A2})))
        (self.r / "a.txt").write_text("user edit\n")
        with self.assertRaises(CBError) as e:
            engine.undo(str(self.r))
        self.assertEqual(e.exception.code, 3); self.assertEqual(self.read("a.txt"), "user edit\n")
        engine.undo(str(self.r), force=True); self.assertEqual(self.read("a.txt"), A)

    def test_branch_after_and_commit_only_patch(self):
        diff = make_diff(self.r, {"a.txt": A2})
        (self.r / "b.txt").write_text("user work\n")      # unrelated dirty file stays unstaged
        meta = engine.apply_plan(plan_of(self.r, diff), branch="feat", commit="ai change")
        self.assertEqual(meta["branch"], "feat"); self.assertEqual(meta["commit"], "ai change")
        self.assertEqual(sh(self.r, "git", "branch", "--show-current").strip(), "feat")
        self.assertIn("a.txt", sh(self.r, "git", "show", "--name-only", "--format=", "HEAD"))
        self.assertNotIn("b.txt", sh(self.r, "git", "show", "--name-only", "--format=", "HEAD"))

    def test_commit_refused_when_target_already_dirty(self):
        diff = make_diff(self.r, {"a.txt": A2})
        (self.r / "a.txt").write_text(A + "mine\n")
        pl = plan_of(self.r, diff)
        with self.assertRaises(CBError):
            engine.apply_plan(pl, commit="x")

    def test_existing_branch_checked_before_apply(self):
        sh(self.r, "git", "branch", "taken")
        diff = make_diff(self.r, {"a.txt": A2})
        with self.assertRaises(CBError):
            engine.apply_plan(plan_of(self.r, diff), branch="taken")
        self.assertEqual(self.read("a.txt"), A)

    def test_fix_prompt(self):
        diff = make_diff(self.r, {"a.txt": A2})
        (self.r / "a.txt").write_text("changed\n")
        pl = plan_of(self.r, diff)
        txt = build_fix_prompt(pl, default_settings()["defaults"])
        self.assertIn("FIX REQUEST", txt); self.assertIn("a.txt", txt); self.assertIn("changed", txt)

    def test_parser_rejects_garbage(self):
        with self.assertRaises(CBError):
            clean_diff("just some words")
        with self.assertRaises(CBError):
            clean_diff("   ")

    def test_counts(self):
        fp = split_patches(clean_diff(make_diff(self.r, {"a.txt": A2})))[0]
        self.assertEqual((fp.added, fp.removed, fp.kind), (2, 1, "MOD"))


if __name__ == "__main__":
    unittest.main()
