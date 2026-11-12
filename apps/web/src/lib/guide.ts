// Language-neutral terminal screens for the guide: they show the app's own English UI exactly as it appears.
// Keep them in sync with apps/desktop (menu, export screen, repo picker). tests/guide.test.ts guards the version.

export interface Shot { title: string; text: string }

export const guideIds = ['install', 'menu', 'export', 'apply', 'undo', 'manage', 'cli', 'trouble'] as const;

// Landing "Need help?" cards, in order: export, apply, trouble.
export const helpTargets = ['export', 'apply', 'trouble'] as const;

const MENU = String.raw`┌─ CodeBridge 3.0.0 ──────────────┐
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

const APPLY = String.raw`Copy the AI's diff (Ctrl+C), then press Enter.
Do NOT paste it here - it is read from your clipboard.
Press Enter when copied (Ctrl+C to cancel)
Source: clipboard
Repo  : /home/me/work/app
Files : 2
  [MOD] lib/main.dart  (+12 -3)  ok
  [MOD] lib/home.dart  (+40 -8)  ok`;

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
  apply: [{ title: '2 → Apply', text: PICKER }, { title: 'Enter', text: APPLY }],
  manage: [{ title: '4 → Projects', text: PROJECTS }],
  cli: [{ title: 'terminal', text: CLI }],
};
