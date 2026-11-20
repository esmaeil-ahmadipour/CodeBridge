// Language-neutral terminal screens for the guide: they show the app's own English UI exactly as it appears.
// Keep them in sync with apps/desktop (menu, export screen, repo picker). The menu version is injected at render time.

export interface Shot { title: string; text: string }

export const guideIds = ['install', 'menu', 'export', 'apply', 'undo', 'manage', 'cli', 'trouble'] as const;

// Landing "Need help?" cards, in order: export, apply, trouble.
export const helpTargets = ['export', 'apply', 'trouble'] as const;

const MENU = String.raw`┌─ CodeBridge {version} ──────────────┐
│  1  Export project for the AI            
│  2  Apply the AI's diff                  
│  3  Undo last applied diff               
│  4  Projects                             
│  5  Settings                             
│  6  History                              
│  0  Exit                                 
└───────────────────────────┘
Type a number, then Enter > `;

const EXPORT = String.raw`Will export: flutter · dart · no locks · no tests
┌─ CodeBridge ─ Export ───────────────────┐
│ Project : [ app ]   (p) change                       
│                                                      
│ Type (one)         Languages (multi)                 
│ (•) 1 flutter      [x] a dart       [ ] f rust       
│ ( ) 2 react        [ ] b javascript [ ] g java       
│ ( ) 3 nextjs       [ ] c typescript [ ] h kotlin     
│ ( ) 4 node         [ ] d python     [ ] i swift      
│ ( ) 5 python       [ ] e go         [ ] j c#         
│ ( ) 6 other                                          
│ Custom languages (x): -                              
│                                                      
│ Options                                              
│  [ ] s  Include SVG contents                         
│  [x] l  Exclude lock files                           
│  [x] t  Exclude tests                                
│  [ ] o  Only changed files                           
│  [x]    Redact secrets (always on)                   
├──────────────────────────────────┤
│ 1-6 type · a-j languages · s l t o options           
│ p project · x custom language · q quit               
└──────────────────────────────────┘
Tick: type keys, e.g. "3 s t", then Enter.   Enter alone = export what you see.
> `;

const EXPORT_DONE = String.raw`>   OK app: 53 files, 95.7 KB, ~24,464 tokens
    -> /home/me/work/code_report_app.txt (104.6 KB)`;

const PICKER = String.raw`Which repo?
  1  app   /home/me/work/app   (last used)
  2  site  /home/me/work/site

Enter = 1  ·  number or name  ·  or type a path  (q = cancel) > `;

const APPLY = String.raw`Diff source (Enter = clipboard, p = paste here, q = cancel): 
Source: clipboard
Repo  : /home/me/work/app
Files : 2
  [MOD] lib/main.dart  (+12 -3)  ok
  [MOD] lib/home.dart  (+40 -8)  ok

Apply these changes? [Y/n] `;

const APPLY_PASTE = String.raw`Diff source (Enter = clipboard, p = paste here, q = cancel): p

Paste the complete diff below.
Finish by entering CODEBRIDGE_END on a line by itself.
(paste the diff here)
CODEBRIDGE_END

Received 24 lines.
First: diff --git a/lib/main.dart b/lib/main.dart
Last : +  runApp(const App());
Full diff is hidden to keep the terminal clean.
Source: /tmp/codebridge-k3j9a2.diff
Repo  : /home/me/work/app
Files : 1
  [MOD] lib/main.dart  (+12 -3)  ok

Apply these changes? [Y/n] `;

const APPLY_DONE = String.raw`Done: 2 applied, 0 skipped. Run 20260101-120000
Undo with: codebridge patch undo -r "/home/me/work/app"`;

const APPLY_FAIL = String.raw`Files : 2
  [MOD] lib/main.dart  (+12 -3)  ok
  [MOD] lib/home.dart  (+40 -8)  CANNOT APPLY
        error: patch failed: lib/home.dart:12
        error: lib/home.dart: patch does not apply

strict mode: nothing was changed
Fix prompt for the AI written to codebridge-fix.txt and copied to the clipboard.
Send it to the AI, then apply the new diff.`;

const APPLY_TOLERANT = String.raw`Files : 1
  [MOD] lib/main.dart  (+12 -3)  ok
Note  : applies in tolerant mode (--recount --ignore-whitespace)

WARNING: Strict apply failed. Git could only accept this diff
using tolerant options.
The patch may have incomplete or unusual hunk context; check the
result afterwards (undo is available).
Apply with tolerant mode? [y/N] `;

const PROJECTS = String.raw`== Projects ==
 1. app  /home/me/work/app
 2. site  /home/me/work/site
  a. Add    d. Delete    0. Back
Choose: `;

const INSTALL = String.raw`# Linux
./run.sh
# macOS (first run only, then double-click or run the launcher)
xattr -d com.apple.quarantine ./codebridge
./run_macos.command
# Windows (PowerShell)
.\run.ps1`;

const CLI = String.raw`codebridge context export --changed
codebridge patch apply fix.patch -r ./app
codebridge patch undo -r ./app
codebridge history -n 10`;

export const guideShots: Record<string, Shot[]> = {
  install: [{ title: 'terminal', text: INSTALL }],
  menu: [{ title: 'codebridge', text: MENU }],
  export: [{ title: '1 → Export', text: EXPORT }, { title: 'Enter', text: EXPORT_DONE }],
  apply: [
    { title: '2 → Apply', text: PICKER },
    { title: 'Enter', text: APPLY },
    { title: 'p', text: APPLY_PASTE },
    { title: 'done', text: APPLY_DONE },
    { title: 'tolerant', text: APPLY_TOLERANT },
    { title: 'strict', text: APPLY_FAIL },
  ],
  manage: [{ title: '4 → Projects', text: PROJECTS }],
  cli: [{ title: 'terminal', text: CLI }],
};
