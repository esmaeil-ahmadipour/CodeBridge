# Report format (contract between web and desktop)

A report is plain UTF-8 text.

~~~text
# INSTRUCTIONS FOR THE AI            (optional) asks for ONE ```diff block, paths relative to the root
# PROJECT: <name>
# Generated: YYYY-MM-DD HH:MM:SS
# FILES: <n>   ~TOKENS: <estimate>   (optional)
# REDACTED: <n> secret(s) hidden     (only when something was hidden)
#----------------------------------------------------------------------

## TREE                              (optional)
```<tree>```

---

/*
FILE:  <relative/path>[ (part i/n)]
SIZE:  <human size>
*/
```<language>
<file text>
~~~

Rules
- Paths are relative to the project root and use `/`.
- Absolute paths are not written to the report.
- Binary files are skipped. Text is decoded as UTF-8, then UTF-16 (BOM), then Windows-1256.
- Secrets matching common patterns are replaced by `[REDACTED ...]` markers.
- Splitting: web splits by bytes (a part never exceeds the chosen size; a very large file continues as `part i/n`);
  desktop splits by token estimate at file boundaries.
