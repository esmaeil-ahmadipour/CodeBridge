import type { Locale } from './config';

interface Pair { t: string; s: string }
interface DiffLine { text: string; kind: 'plain' | 'removed' | 'added' }
interface PhoneFile { path: string; status: string; kind: 'removed' | 'secret' | 'included' }

export interface GuideSection {
  id: string; title: string; intro: string;
  steps?: string[]; keys?: Pair[]; notes?: string[]; qa?: Pair[];
}

export interface Dictionary {
  metadata: { title: string; description: string };
  nav: { how: string; mobile: string; features: string; trust: string; web: string; download: string; theme: string; language: string; skip: string; guide: string };
  hero: {
    eyebrow: string; title: string; titleAccent: string; sub: string; ctaDownload: string; ctaMobile: string;
    proof: string[]; previewLabel: string; previewTitle: string; previewLines: DiffLine[]; previewResult: string; undo: string;
  };
  mobile: {
    eyebrow: string; title: string; text: string; benefits: string[]; android: string; iphone: string; note: string;
    project: string; files: PhoneFile[]; ready: string;
  };
  how: { title: string; steps: Pair[] };
  tool: {
    title: string; sub: string; choose: string; chooseHint: string;
    optGitignore: string; optRedact: string; optCompact: string; optHeader: string; optTree: string;
    split: string; splitOff: string; 
    pick: string; pickCount: string; dlgTitle: string; dlgHint: string; selAll: string; selNone: string; done: string; cancel: string; applyChanges: string; pendChanges: string; pendNone: string; hideTitle: string; hideImages: string; hideLocks: string; projNone: string; lockHint: string; projLabel: string; hideTests: string; applying: string; applied: string; pendOpts: string; resSize: string; splitNote: string;
    convert: string; convertAgain: string; working: string;
    resFiles: string; resTokens: string; resRedacted: string; resSkipped: string;
    download: string; downloadPart: string; copy: string; copyPart: string; copied: string;
    errNotZip: string; errEmpty: string; errRead: string; errBig: string;
  };
  privacy: { title: string; items: Pair[] };
  features: { title: string; beforeTitle: string; beforeItems: string[]; afterTitle: string; afterItems: string[] };
  download: {
    eyebrow: string; title: string; sub: string; osPrompt: string; desktopNote: string; browserCta: string; installMore: string; installTitle: string; installSteps: string[]; guideLink: string;
    pwaBadge: string; pwaTitle: string; pwaText: string;
    android: string; iphone: string; steps: string[]; install: string; installed: string; iosHint: string; noPrompt: string;
    desktop: string; win: string; mac: string; linux: string; appleSilicon: string; note: string;
    winHint: string; macHint: string; linuxHint: string; releaseChecksums: string;
    installNotes: string;
    recommended: string; hintDefault: string; hintMobile: string; downloadFor: string; dlAria: string;
    relVersion: string; relPublished: string;
  };
  footer: { license: string; tagline: string; developer: string; developerName: string };
  guide: {
    metadata: { title: string; description: string };
    eyebrow: string; title: string; sub: string; toc: string; home: string; shotLabel: string;
    sections: GuideSection[];
  };
  help: { title: string; sub: string; items: Pair[]; cta: string };
}

export const translations: Record<Locale, Dictionary> = {
  en: {
    metadata: {
      title: 'CodeBridge: Codebase to Prompt & AI Diff Tool',
      description:
        'Convert a project ZIP into clean, AI-ready code context in your browser. Apply AI-generated Git diffs with the desktop app. Free and private. Nothing is uploaded.',
    },
    nav: { how: 'How it works', mobile: 'Android & iOS', features: 'Features', trust: 'Privacy', web: 'Web tool', download: 'Download', theme: 'Switch light or dark theme', language: 'Language', skip: 'Skip to content', guide: 'Guide' },
    hero: {
      eyebrow: 'An AI-assisted tool for developers',
      title: 'Give AI clean code,',
      titleAccent: 'bring changes back without copy-paste.',
      sub: 'Turn a codebase ZIP into clean, AI-ready code context without unnecessary files or wasted tokens. Use the desktop app to apply AI-generated Git diffs directly to your project, then undo changes when needed.',
      ctaDownload: 'Download the desktop app',
      ctaMobile: 'Try it in your phone or desktop browser',
      proof: ['Your code is not uploaded', 'Android, iOS and desktop', 'Precise undo', 'Free and open source'],
      previewLabel: 'An example of applying an AI diff',
      previewTitle: 'Copy the AI diff, press Enter',
      previewLines: [
        { text: '--- a/src/auth.py', kind: 'plain' },
        { text: '+++ b/src/auth.py', kind: 'plain' },
        { text: '- if token == None:', kind: 'removed' },
        { text: '+ if not token:', kind: 'added' },
        { text: '+ raise AuthError("missing token")', kind: 'added' },
      ],
      previewResult: 'Applied: 3 files, without opening a folder',
      undo: 'Undo',
    },
    mobile: {
      eyebrow: 'Android & iOS',
      title: 'Send your project source to AI from your phone, too',
      text: 'Choose your project ZIP in your phone’s browser and get text ready to send to AI. No install, no upload, and no searching through files yourself. The less AI receives, the fewer tokens it uses.',
      benefits: [
        'Unneeded files and dependencies are removed automatically',
        'Keys and passwords are masked before sharing',
        'No security setup and no manual file search',
      ],
      android: 'Start on Android',
      iphone: 'Start on iPhone (iOS)',
      note: 'No install; straight from your phone browser',
      project: 'Your project',
      files: [
        { path: 'node_modules/', status: 'Removed', kind: 'removed' },
        { path: 'package-lock.json', status: 'Removed', kind: 'removed' },
        { path: '.env', status: 'Masked', kind: 'secret' },
        { path: 'src/', status: 'Included', kind: 'included' },
      ],
      ready: 'Ready to send to AI',
    },
    how: {
      title: 'Three steps, without the hassle',
      steps: [
        { t: 'Export', s: 'Ignores, dependencies, SVGs, lockfiles and tests are removed automatically; only what AI needs remains.' },
        { t: 'Ask for a diff', s: 'Give the text to AI and ask it to return only the changes as a diff.' },
        { t: 'Apply', s: 'Copy the diff and press Enter. Changes are applied to the project, with a snapshot and precise undo.' },
      ],
    },
    tool: {
      title: 'Only need an export? Right here, in your browser',
      sub: 'Convert a project ZIP into an AI-ready code context file right in your browser. No installation or upload required. Apply AI-generated Git diffs and undo changes with the desktop app.',
      choose: 'Choose ZIP',
      chooseHint: 'from Files, Drive or Downloads',
      optGitignore: 'Respect .gitignore', optRedact: 'Hide secrets', optCompact: 'Compact', optHeader: 'AI instructions', optTree: 'File tree',
      split: 'Split report', splitOff: 'No split',       pick: 'Choose files and folders', pickCount: '{a} of {b} files selected', dlgTitle: 'Choose what to include', dlgHint: 'Untick a folder or a file to leave it out of the report.', selAll: 'Select all', selNone: 'Unselect all', done: 'Done', cancel: 'Cancel', applyChanges: 'Apply changes', pendChanges: 'Pending: {r} to remove from the report, {a} to add back', pendNone: 'No pending changes', hideTitle: 'Hide file contents from the report (the path stays)', hideImages: 'Hide the contents of image files (e.g. SVG)', hideLocks: 'Hide the contents of lock files', projNone: 'Not selected', lockHint: 'Pick your project type to enable the lock and test options.', projLabel: 'Project type', hideTests: 'Hide the contents of test files', applying: 'Applying…', applied: 'Done', pendOpts: 'display options changed', resSize: 'Report size: {size}', splitNote: 'Each part stays within the chosen size. A very large file continues in the next part.',
      convert: 'Convert', convertAgain: 'Convert again', working: 'Reading {done} of {total}…',
      resFiles: '{n} files', resTokens: '≈ {n} tokens', resRedacted: '{n} secrets hidden', resSkipped: '{n} skipped (ignored, binary or too large)',
            download: 'Download TXT', downloadPart: 'Download part {n}', copy: 'Copy', copyPart: 'Copy part {n}', copied: 'Copied',
      errNotZip: 'This does not look like a ZIP file.',
      errEmpty: 'No readable text files matched. Try turning off .gitignore.',
      errRead: 'Could not read this ZIP: {msg}',
      errBig: 'Large ZIP ({mb} MB): it may be slow on this device.',
    },
    features: {
      title: 'Why does manual code copying waste your time and tokens?',
      beforeTitle: 'Without CodeBridge',
      beforeItems: [
        'AI says “change line 42”.',
        'You open the folder and find the file.',
        'You find the line and copy it manually, now for 10 files.',
        'To share the project, you also manually remove node_modules, lockfiles and SVGs, or waste tokens.',
      ],
      afterTitle: 'With CodeBridge',
      afterItems: [
        'Convert the project to text in one click, without extra files.',
        'Ask AI only for a diff.',
        'Give it the diff and CodeBridge applies it to the project.',
        'Wrong? Undo everything with one click.',
      ],
    },
    privacy: {
      title: 'Why trust CodeBridge?',
      items: [
        { t: 'Safe apply', s: 'Changes are applied atomically and only touch files in that patch.' },
        { t: 'Precise undo', s: 'Every run gets a snapshot and can be fully reverted.' },
        { t: 'Secret removal', s: 'Keys and passwords are masked before being sent to AI.' },
        { t: 'Fully local', s: 'Nothing is uploaded, and it works offline.' },
      ],
    },
    download: {
      eyebrow: 'Free · Open source · Works everywhere',
      title: 'Spend your time on valuable decisions, not digging through files',
      sub: 'Leave repetitive code preparation and application to CodeBridge; free your mind for architecture, quality and the decisions that truly add value to your product.',
      osPrompt: 'Choose your operating system to get the right version',
      desktopNote: 'The desktop app applies diffs and supports undo. Only need an export?',
      browserCta: 'Try the browser version on your phone or desktop',
      installMore: 'Install the web app',
      installTitle: 'How to install the desktop app',
      installSteps: ['Download the ZIP for your system and unzip it. No installer is needed.', 'Open the launcher inside: run.ps1 on Windows, run_macos.command on macOS, run.sh on Linux.', 'The menu opens in a terminal. Type 1 to export a project or 2 to apply an AI diff.'],
      guideLink: 'Read the full guide',
      pwaBadge: 'PWA · No store needed',
      pwaTitle: 'Android & iPhone, installed in 10 seconds',
      pwaText: 'Add it to your Home Screen. It opens like an app, works offline, and your files never leave your phone.',
      android: 'Android', iphone: 'iPhone',
      steps: ['Open this page in Chrome or Safari', 'Tap the menu or Share button', 'Choose Add to Home Screen'],
      install: 'Install on this phone', installed: 'Installed',
      iosHint: 'On iPhone use Safari: tap Share, then Add to Home Screen.',
      noPrompt: 'Use your browser menu and choose Install app or Add to Home Screen.',
      desktop: 'Desktop apps', win: 'Windows', mac: 'macOS', linux: 'Linux', appleSilicon: 'Apple Silicon',
      note: 'Git must be installed for patch features.',
      winHint: 'First run: SmartScreen may warn because the binary is unsigned. Choose More info, then Run anyway.',
      macHint: 'First run: right-click run_macos.command and choose Open, or run `xattr -d com.apple.quarantine ./codebridge`. Intel Macs are not supported.',
      linuxHint: 'If needed, run `chmod +x codebridge run.sh` before launching.',
      releaseChecksums: 'Checksums and source on GitHub',
      installNotes: 'Install notes',
      recommended: 'Recommended', hintDefault: 'Choose the package for your system.', hintMobile: 'Desktop apps are for computers. On a phone, install the web app below.', downloadFor: 'Download for {os}', dlAria: '{label}, {arch}, {format}', relVersion: 'Application version: {v}', relPublished: 'Published {date}',
    },
    footer: { license: 'MIT license', tagline: 'CodeBridge · Free and open-source tool for working with AI', developer: 'Developer', developerName: 'Esmaeil Ahmadipour' },
    guide: {
      metadata: { title: 'CodeBridge Guide: Export Code & Apply AI Diffs', description: 'Learn how to export your codebase for AI, apply AI-generated Git diffs safely, undo changes, and troubleshoot the CodeBridge desktop app.' },
      eyebrow: 'Guide · Desktop app {version}',
      title: 'Learn CodeBridge in 5 minutes',
      sub: 'Export your project for an AI, apply its reply safely, and undo if needed. The screens below are exactly what you see in the app.',
      toc: 'On this page',
      home: 'Back to home',
      shotLabel: 'Example of what you see in the terminal',
      sections: [
        {
          id: 'install',
          title: 'Install and start',
          intro: 'Download the ZIP for your system from Releases, unzip it and run the launcher. No installer and no Python needed. Git must be installed to apply diffs.',
          steps: ['Download the ZIP for your system from the Releases page and unzip it.', 'Start the launcher: run.sh on Linux, run_macos.command on macOS, run.ps1 on Windows.', 'The menu opens. Type a number and press Enter.'],
          notes: ['macOS first run: run the xattr line once, because the app is not signed.', 'Windows may show SmartScreen: choose More info, then Run anyway.'],
        },
        {
          id: 'menu',
          title: 'The main menu',
          intro: 'Type the number of what you want and press Enter. Type 0 to leave.',
          keys: [
            { t: '1', s: 'Export: build the text file you give to the AI.' },
            { t: '2', s: 'Apply: put the AI’s diff into your project.' },
            { t: '3', s: 'Undo: restore the files of the last apply.' },
            { t: '4', s: 'Projects: save folders so you can pick them by name.' },
            { t: '5', s: 'Settings: change defaults such as folders to skip.' },
            { t: '6', s: 'History: see recent exports and applies.' },
            { t: '0', s: 'Exit.' },
          ],
        },
        {
          id: 'export',
          title: 'Export a Codebase for AI Context',
          intro: 'Everything is on one page. Tick what you want, then press Enter. Pressing Enter alone exports exactly what you see.',
          steps: ['Pick the project first: type p, then choose it from the list or type its folder.', 'Type keys separated by spaces, for example “3 s t”: a Next.js project, with SVG contents and with test files. Typing a key again undoes it.', 'Read the “Will export” line above the box, then press Enter on an empty line.'],
          keys: [
            { t: '1-6', s: 'Project type (one). Changing it resets the languages to that type’s defaults.' },
            { t: 'a-j', s: 'Turn languages on or off.' },
            { t: 'x', s: 'Add a custom language, for example lua.' },
            { t: 's', s: 'Include the contents of SVG files.' },
            { t: 'l', s: 'Exclude lock files such as package-lock.json and pubspec.lock.' },
            { t: 't', s: 'Exclude test files and folders.' },
            { t: 'o', s: 'Only the files changed in git.' },
            { t: 'p', s: 'Choose another project.' },
            { t: 'q', s: 'Cancel and go back.' },
          ],
          notes: ['Secrets are always hidden in the report. Still skim it before you share it.', 'The report is saved as code_report_<project>.txt in the folder you started the app from. Give that file to the AI.', 'Your choices are remembered for the next export.'],
        },
        {
          id: 'apply',
          title: 'Apply an AI-Generated Git Diff',
          intro: 'Ask the AI to answer with a git diff. CodeBridge then puts it into your project safely: it checks everything first and changes nothing if any part fails.',
          steps: ['In the AI’s reply, copy the whole diff with Ctrl+C (or its copy button).', 'In CodeBridge type 2 and press Enter, then choose the repo: Enter picks the first one in the list, or type a number, a name or a folder.', 'When asked, press Enter. The diff is read from your clipboard. Do not paste it into the terminal: a multi-line paste is cut after the first line.', 'Look at the list of files, confirm, and you are done.'],
          notes: ['If the diff does not apply, nothing changes and the app writes codebridge-fix.txt (also copied to the clipboard). Send it back to the AI.', 'Git must be installed. Your uncommitted work stays untouched.'],
        },
        {
          id: 'undo',
          title: 'Undo the last apply',
          intro: 'Changed your mind, or the result is wrong? Type 3, choose the repo, and the files are restored exactly as they were.',
          steps: ['Type 3 and press Enter.', 'Choose the repo the same way as in Apply.'],
          notes: ['If you edited a file after the apply, undo refuses to overwrite it. In the CLI, use --force only if you are sure.'],
        },
        {
          id: 'manage',
          title: 'Projects, Settings and History',
          intro: 'Save your folders once, then pick them by name everywhere.',
          keys: [
            { t: '4', s: 'Projects: a adds a folder (optionally with a preset: flutter, node, python), d removes one.' },
            { t: '5', s: 'Settings: type a number to change it, for example folders to skip, max file size, split size or copy to clipboard. r resets everything.' },
            { t: '6', s: 'History: recent exports and applies.' },
          ],
        },
        {
          id: 'cli',
          title: 'For scripts and power users',
          intro: 'Every menu action is also a command. Run codebridge --help to see all of them.',
          keys: [
            { t: 'codebridge context export --changed', s: 'Export only the changed files.' },
            { t: 'codebridge patch apply fix.patch -r ./app', s: 'Apply a diff file to a repo.' },
            { t: 'codebridge patch undo -r ./app', s: 'Undo the last apply.' },
            { t: 'codebridge history -n 10', s: 'Show the last 10 runs.' },
          ],
          notes: ['More commands are listed in docs/USAGE.md on GitHub.'],
        },
        {
          id: 'trouble',
          title: 'Fix common problems',
          intro: 'Find your message or symptom below.',
          qa: [
            { t: 'My diff is cut when I paste it', s: 'Do not paste. Copy the diff (Ctrl+C), choose 2, then press Enter. It is read from the clipboard.' },
            { t: '“Clipboard has no diff”', s: 'Copy the full AI reply or the whole diff block again and retry. On Linux, install xclip, xsel or wl-clipboard.' },
            { t: 'The diff failed to apply', s: 'Nothing was changed. Send codebridge-fix.txt to the AI and apply its new answer.' },
            { t: '“no terminal to confirm; re-run with -y”', s: 'This appears only when the app does not run in a real terminal, for example inside a script. Use a normal terminal, or add -y.' },
            { t: '“Folder not found”', s: 'Type the full path, or save the project once in Projects (4) and pick it by number.' },
            { t: '“Pick at least one language”', s: 'Press a letter from a to j (or x for a custom one), then Enter.' },
            { t: 'Git is missing', s: 'Apply and Undo need Git. Install it from git-scm.com and restart the terminal.' },
            { t: 'macOS cannot open the app', s: 'In the unzipped folder run: xattr -d com.apple.quarantine ./codebridge' },
            { t: 'Windows SmartScreen warning', s: 'Choose More info, then Run anyway. The binary is not code-signed.' },
          ],
        },
      ],
    },
    help: {
      title: 'Need help?',
      sub: 'The guide takes you from install to undo, with screens you can compare against what you see.',
      items: [
        { t: 'Export on one screen', s: 'Which keys to press and what each option does.' },
        { t: 'Apply an AI diff', s: 'Copy, press Enter, done. And why you must not paste.' },
        { t: 'Something went wrong?', s: 'Short fixes for the most common messages.' },
      ],
      cta: 'Open the full guide',
    },
  },
  fa: {
    metadata: {
      title: 'CodeBridge: تبدیل کد به متن AI و اعمال Git Diff',
      description:
        'فایل ZIP پروژه را در مرورگر به متن آماده‌ی هوش مصنوعی تبدیل کنید. تغییرات Git Diff تولیدشده توسط AI را با اپ دسکتاپ اعمال کنید. رایگان و خصوصی، بدون آپلود کد.',
    },
    nav: { how: 'چطور کار می‌کند', mobile: 'اندروید و iOS', features: 'امکانات', trust: 'حریم خصوصی', web: 'ابزار وب', download: 'دانلود', theme: 'تغییر تم روشن یا تاریک', language: 'زبان', skip: 'رفتن به محتوا', guide: 'راهنما' },
    hero: {
      eyebrow: 'ابزار برنامه‌نویسانِ همراه با هوش مصنوعی',
      title: 'کدت را تمیز به AI بده،',
      titleAccent: 'تغییرات را بدون کپی‌پیست برگردان.',
      sub: 'CodeBridge پروژه‌ات را امن و بدون فایل‌های اضافه به متن تبدیل می‌کند تا توکن هدر نرود، و diff جواب هوش مصنوعی را خودش روی پروژه اعمال می‌کند. دیگر لازم نیست فایل باز کنی، دنبال خط بگردی و یکی‌یکی کپی کنی.',
      ctaDownload: 'دانلود اپ دسکتاپ',
      ctaMobile: 'امتحان در مرورگر گوشی یا دسکتاپ',
      proof: ['کد آپلود نمی‌شود', 'اندروید، iOS و دسکتاپ', 'Undo دقیق', 'رایگان و متن‌باز'],
      previewLabel: 'نمونه‌ی اعمال diff جواب هوش مصنوعی',
      previewTitle: 'جواب AI (diff) را کپی کن، Enter بزن',
      previewLines: [
        { text: '--- a/src/auth.py', kind: 'plain' },
        { text: '+++ b/src/auth.py', kind: 'plain' },
        { text: '- if token == None:', kind: 'removed' },
        { text: '+ if not token:', kind: 'added' },
        { text: '+ raise AuthError("missing token")', kind: 'added' },
      ],
      previewResult: 'اعمال شد: ۳ فایل، بدون باز کردن پوشه',
      undo: 'Undo',
    },
    mobile: {
      eyebrow: 'اندروید و iOS',
      title: 'سورس پروژه را از گوشی هم برای AI بفرست',
      text: 'ZIP پروژه را در مرورگر گوشی انتخاب کن و متنِ آماده‌ی ارسال به هوش مصنوعی را بگیر. بدون نصب، بدون آپلود و بدون اینکه خودت دنبال فایل‌ها بگردی. هرچه کمتر به AI برسد، توکن کمتری مصرف می‌شود.',
      benefits: [
        'فایل‌های بی‌مصرف و وابستگی‌ها خودکار کنار می‌روند',
        'کلیدها و رمزها پیش از ارسال پوشانده می‌شوند',
        'بدون تنظیم امنیتی و بدون جست‌وجوی دستی فایل',
      ],
      android: 'شروع از گوشی اندروید',
      iphone: 'شروع از آیفون (iOS)',
      note: 'بدون نصب؛ مستقیم در مرورگر گوشی',
      project: 'پروژه‌ی شما',
      files: [
        { path: 'node_modules/', status: 'حذف شد', kind: 'removed' },
        { path: 'package-lock.json', status: 'حذف شد', kind: 'removed' },
        { path: '.env', status: 'پوشانده شد', kind: 'secret' },
        { path: 'src/', status: 'ارسال می‌شود', kind: 'included' },
      ],
      ready: 'آماده‌ی ارسال به AI',
    },
    how: {
      title: 'در سه قدم، بدون درگیری',
      steps: [
        { t: 'خروجی بگیر', s: 'ignoreها، وابستگی‌ها، SVG، فایل‌های lock و تست‌ها خودکار کنار می‌روند؛ فقط چیزی که AI لازم دارد باقی می‌ماند.' },
        { t: 'diff بخواه', s: 'متن را به AI بده و بخواه فقط تغییرات را به‌صورت diff برگرداند.' },
        { t: 'اعمال کن', s: 'diff را کپی کن و Enter بزن. تغییرات روی پروژه اعمال می‌شود، همراه با snapshot و Undo دقیق.' },
      ],
    },
    tool: {
      title: 'فقط خروجی می‌خواهی؟ همین‌جا، در مرورگر',
      sub: 'ZIP را بینداز و متن آماده بگیر؛ بدون نصب و بدون آپلود، روی گوشی و دسکتاپ. اعمال diff و Undo در اپ دسکتاپ انجام می‌شود.',
      choose: 'انتخاب ZIP',
      chooseHint: 'از Files، Drive یا Downloads',
      optGitignore: 'رعایت .gitignore', optRedact: 'پنهان‌کردن رمزها', optCompact: 'فشرده', optHeader: 'دستور برای AI', optTree: 'درخت فایل',
      split: 'تقسیم گزارش', splitOff: 'بدون تقسیم',       pick: 'انتخاب فایل‌ها و پوشه‌ها', pickCount: '{a} از {b} فایل انتخاب شده', dlgTitle: 'انتخاب آنچه وارد گزارش شود', dlgHint: 'تیک پوشه یا فایلی را که نمی‌خواهید در گزارش باشد بردارید.', selAll: 'انتخاب همه', selNone: 'برداشتن همه', done: 'تأیید', cancel: 'انصراف', applyChanges: 'تأیید و اعمال تغییرات', pendChanges: 'در انتظار تأیید: {r} فایل حذف از گزارش، {a} فایل بازگردانی', pendNone: 'تغییری در انتظار نیست', hideTitle: 'حذف محتوای فایل‌ها از گزارش (مسیر فایل می‌ماند)', hideImages: 'محتوای فایل‌های تصویری (مثل SVG) نمایش داده نشود', hideLocks: 'محتوای فایل‌های lock نمایش داده نشود', projNone: 'انتخاب نشده', lockHint: 'برای فعال شدن گزینه‌های lock و تست، نوع پروژه را انتخاب کنید.', projLabel: 'نوع پروژه', hideTests: 'محتوای فایل‌های تست (test) نمایش داده نشود', applying: 'در حال اعمال…', applied: 'انجام شد', pendOpts: 'تنظیمات نمایش تغییر کرده', resSize: 'حجم گزارش: {size}', splitNote: 'هر بخش از حجم انتخابی بیشتر نمی‌شود. فایل خیلی بزرگ در بخش بعدی ادامه پیدا می‌کند.',
      convert: 'تبدیل', convertAgain: 'تبدیل دوباره', working: 'خواندن {done} از {total}…',
      resFiles: '{n} فایل', resTokens: '≈ {n} توکن', resRedacted: '{n} رمز پنهان شد', resSkipped: '{n} مورد رد شد (نادیده‌گرفته، باینری یا بزرگ)',
            download: 'دانلود TXT', downloadPart: 'دانلود بخش {n}', copy: 'کپی', copyPart: 'کپی بخش {n}', copied: 'کپی شد',
      errNotZip: 'این فایل شبیه ZIP نیست.',
      errEmpty: 'هیچ فایل متنی قابل‌خواندن پیدا نشد. .gitignore را خاموش کنید و دوباره امتحان کنید.',
      errRead: 'خواندن این ZIP ممکن نشد: {msg}',
      errBig: 'ZIP بزرگ ({mb} مگابایت): ممکن است روی این دستگاه کند باشد.',
    },
    features: {
      title: 'چرا کپی دستیِ کد، وقت و توکنت را می‌سوزاند؟',
      beforeTitle: 'بدون CodeBridge',
      beforeItems: [
        'AI می‌گوید «خط ۴۲ را عوض کن»',
        'پوشه را باز می‌کنی و فایل را پیدا می‌کنی',
        'خط را پیدا و دستی کپی می‌کنی، این بار برای ۱۰ فایل',
        'برای ارسال پروژه هم node_modules، فایل‌های lock و SVG را دستی کنار می‌گذاری، وگرنه توکن‌هایت هدر می‌رود',
      ],
      afterTitle: 'با CodeBridge',
      afterItems: [
        'پروژه با یک کلیک و بدون فایل اضافه به متن تبدیل می‌شود',
        'از AI فقط diff می‌خواهی',
        'diff را می‌دهی و CodeBridge خودش روی پروژه اعمال می‌کند',
        'اشتباه بود؟ با یک Undo همه‌چیز برمی‌گردد',
      ],
    },
    privacy: {
      title: 'چرا می‌توان به CodeBridge اعتماد کرد؟',
      items: [
        { t: 'اعمال امن', s: 'اعمال تغییرات اتمیک است و فقط فایل‌های همان پچ را لمس می‌کند.' },
        { t: 'Undo دقیق', s: 'از هر اجرا snapshot گرفته می‌شود و برگشت کامل است.' },
        { t: 'حذف اسرار', s: 'کلیدها و رمزها پیش از ارسال به AI پوشانده می‌شوند.' },
        { t: 'کاملاً محلی', s: 'چیزی آپلود نمی‌شود و آفلاین هم کار می‌کند.' },
      ],
    },
    download: {
      eyebrow: 'رایگان · متن‌باز · همه‌جا',
      title: 'زمانت را صرف تصمیم‌های ارزشمند کن، نه زیر و رو کردن فایل‌ها',
      sub: 'کارهای تکراری آماده‌سازی و اعمال کد را به CodeBridge بسپار؛ ذهنت برای معماری، کیفیت و تصمیم‌هایی آزاد می‌ماند که واقعاً به ارزش محصول اضافه می‌کنند.',
      osPrompt: 'سیستم‌عامل خودت را انتخاب کن تا نسخه‌ی مناسب دانلود شود',
      desktopNote: 'اپ دسکتاپ برای اعمال diff و Undo است. فقط خروجی می‌خواهی؟',
      browserCta: 'نسخه‌ی مرورگر را روی گوشی یا دسکتاپ امتحان کن',
      installMore: 'نصب اپ وب',
      installTitle: 'نصب اپ دسکتاپ',
      installSteps: ['ZIP مخصوص سیستم‌تان را دانلود و باز کنید. نصب‌کننده لازم نیست.', 'فایل اجرا را داخل پوشه بزنید: در ویندوز run.ps1، در مک run_macos.command و در لینوکس run.sh.', 'منو در ترمینال باز می‌شود. عدد 1 را برای خروجی گرفتن از پروژه و 2 را برای اعمال Diff بزنید.'],
      guideLink: 'خواندن راهنمای کامل',
      pwaBadge: 'PWA · بدون نیاز به استور',
      pwaTitle: 'اندروید و آیفون، نصب در ۱۰ ثانیه',
      pwaText: 'آن را به صفحه‌ی اصلی اضافه کنید. مثل اپ باز می‌شود، آفلاین کار می‌کند و فایل‌هایتان از گوشی بیرون نمی‌رود.',
      android: 'اندروید', iphone: 'آیفون',
      steps: ['این صفحه را در Chrome یا Safari باز کنید', 'دکمه‌ی منو یا Share را بزنید', 'Add to Home Screen را انتخاب کنید'],
      install: 'نصب روی این گوشی', installed: 'نصب شده',
      iosHint: 'در آیفون از Safari استفاده کنید: Share و سپس Add to Home Screen.',
      noPrompt: 'از منوی مرورگر، Install app یا Add to Home Screen را انتخاب کنید.',
      desktop: 'اپ‌های دسکتاپ', win: 'ویندوز', mac: 'مک', linux: 'لینوکس', appleSilicon: 'Apple Silicon',
      note: 'برای قابلیت‌های Patch باید Git نصب باشد.',
      winHint: 'در نخستین اجرا، SmartScreen ممکن است دربارهٔ امضانشدن برنامه هشدار دهد. «More info» و سپس «Run anyway» را انتخاب کنید.',
      macHint: 'در نخستین اجرا، روی run_macos.command راست‌کلیک و Open را انتخاب کنید، یا دستور `xattr -d com.apple.quarantine ./codebridge` را اجرا کنید. مک‌های Intel پشتیبانی نمی‌شوند.',
      linuxHint: 'در صورت نیاز، پیش از اجرا `chmod +x codebridge run.sh` را اجرا کنید.',
      releaseChecksums: 'Checksumها و کد منبع در GitHub',
      installNotes: 'نکات اجرا',
      recommended: 'پیشنهادی', hintDefault: 'بسته‌ی مناسب سیستم خود را انتخاب کنید.', hintMobile: 'اپ‌های دسکتاپ برای کامپیوتر هستند. روی گوشی، نسخه‌ی وب را در پایین نصب کنید.', downloadFor: 'دانلود برای {os}', dlAria: '{label}، {arch}، {format}', relVersion: 'نسخه‌ی برنامه: {v}', relPublished: 'منتشرشده در {date}',
    },
    footer: { license: 'مجوز MIT', tagline: 'CodeBridge · ابزار رایگان و متن‌باز برای کار با هوش مصنوعی', developer: 'توسعه‌دهنده', developerName: 'اسماعیل احمدی‌پور' },
    guide: {
      metadata: { title: 'راهنمای CodeBridge: خروجی کد و اعمال Git Diff', description: 'یاد بگیرید چطور از کد پروژه برای هوش مصنوعی خروجی بگیرید، Git Diff تولیدشده توسط AI را امن اعمال کنید، تغییرات را برگردانید و مشکلات رایج را رفع کنید.' },
      eyebrow: 'راهنما · اپ دسکتاپ {version}',
      title: 'CodeBridge را در ۵ دقیقه یاد بگیرید',
      sub: 'پروژه‌تان را برای AI خروجی بگیرید، پاسخ آن را امن اعمال کنید و در صورت نیاز Undo بزنید. صفحه‌های زیر دقیقاً همان چیزی است که در برنامه می‌بینید.',
      toc: 'در این صفحه',
      home: 'بازگشت به صفحه‌ی اصلی',
      shotLabel: 'نمونه‌ی آنچه در ترمینال می‌بینید',
      sections: [
        {
          id: 'install',
          title: 'نصب و اجرا',
          intro: 'ZIP مخصوص سیستم‌تان را از صفحه‌ی Releases بگیرید، باز کنید و فایل اجرا را بزنید. نصب‌کننده و Python لازم نیست. برای اعمال Diff باید Git نصب باشد.',
          steps: ['ZIP مخصوص سیستم‌تان را از صفحه‌ی Releases دانلود و باز کنید.', 'فایل اجرا را بزنید: در لینوکس run.sh، در مک run_macos.command و در ویندوز run.ps1.', 'منو باز می‌شود. شماره‌ی گزینه را بنویسید و Enter بزنید.'],
          notes: ['اجرای اول در مک: خط xattr را یک‌بار بزنید، چون برنامه امضا نشده است.', 'ویندوز ممکن است SmartScreen نشان دهد: More info و سپس Run anyway را بزنید.'],
        },
        {
          id: 'menu',
          title: 'منوی اصلی',
          intro: 'شماره‌ی کار موردنظر را بنویسید و Enter بزنید. با 0 خارج می‌شوید.',
          keys: [
            { t: '1', s: 'Export: فایل متنی‌ای می‌سازد که به AI می‌دهید.' },
            { t: '2', s: 'Apply: Diff پاسخ AI را در پروژه‌تان اعمال می‌کند.' },
            { t: '3', s: 'Undo: فایل‌های آخرین اعمال را برمی‌گرداند.' },
            { t: '4', s: 'Projects: پوشه‌ها را ذخیره می‌کند تا با نام انتخابشان کنید.' },
            { t: '5', s: 'Settings: پیش‌فرض‌ها (مثل پوشه‌های ردشونده) را تغییر می‌دهد.' },
            { t: '6', s: 'History: خروجی‌ها و اعمال‌های اخیر را نشان می‌دهد.' },
            { t: '0', s: 'خروج.' },
          ],
        },
        {
          id: 'export',
          title: 'خروجی گرفتن از کدبیس برای AI',
          intro: 'همه‌چیز در یک صفحه است. موارد را تیک بزنید و Enter بزنید. Enter خالی دقیقاً همان چیزی را خروجی می‌گیرد که می‌بینید.',
          steps: ['اول پروژه را انتخاب کنید: p را بزنید و از لیست انتخاب کنید یا پوشه را بنویسید.', 'کلیدها را با فاصله بنویسید؛ مثلاً «3 s t» یعنی پروژه‌ی Next.js، با محتوای SVG و با فایل‌های تست. زدن دوباره‌ی یک کلید آن را برمی‌گرداند.', 'خط «Will export» بالای کادر را بخوانید و روی یک خط خالی Enter بزنید.'],
          keys: [
            { t: '1-6', s: 'نوع پروژه (یکی). با تغییر آن، زبان‌ها به پیش‌فرض همان نوع برمی‌گردند.' },
            { t: 'a-j', s: 'روشن یا خاموش‌کردن زبان‌ها.' },
            { t: 'x', s: 'افزودن زبان دلخواه، مثل lua.' },
            { t: 's', s: 'محتوای فایل‌های SVG هم بیاید.' },
            { t: 'l', s: 'فایل‌های lock (مثل package-lock.json و pubspec.lock) نیایند.' },
            { t: 't', s: 'فایل‌ها و پوشه‌های تست نیایند.' },
            { t: 'o', s: 'فقط فایل‌های تغییرکرده در git.' },
            { t: 'p', s: 'انتخاب پروژه‌ی دیگر.' },
            { t: 'q', s: 'انصراف و بازگشت.' },
          ],
          notes: ['رمزها همیشه در گزارش پنهان می‌شوند؛ باز هم پیش از اشتراک‌گذاری گزارش را مرور کنید.', 'گزارش با نام code_report_<project>.txt در همان پوشه‌ای که برنامه را از آن اجرا کرده‌اید ذخیره می‌شود. این فایل را به AI بدهید.', 'انتخاب‌هایتان برای خروجی بعدی یادآوری می‌شود.'],
        },
        {
          id: 'apply',
          title: 'اعمال Git Diff تولیدشده توسط AI',
          intro: 'از AI بخواهید پاسخ را به‌صورت git diff بدهد. بعد CodeBridge آن را امن در پروژه می‌گذارد: اول همه‌چیز را بررسی می‌کند و اگر بخشی شکست بخورد هیچ چیز را عوض نمی‌کند.',
          steps: ['در پاسخ AI کل Diff را با Ctrl+C کپی کنید (یا با دکمه‌ی کپی).', 'در CodeBridge عدد 2 را بزنید و ریپو را انتخاب کنید: Enter اولین مورد لیست را برمی‌دارد، یا شماره، نام یا پوشه را بنویسید.', 'وقتی خواست، Enter بزنید. Diff از کلیپ‌بورد خوانده می‌شود. آن را در ترمینال Paste نکنید؛ Paste چندخطی بعد از خط اول بریده می‌شود.', 'فهرست فایل‌ها را ببینید و تأیید کنید؛ تمام.'],
          notes: ['اگر Diff اعمال نشود هیچ چیز عوض نمی‌شود و فایل codebridge-fix.txt ساخته (و کپی) می‌شود. آن را برای AI بفرستید.', 'Git باید نصب باشد. کارهای Commit‌نشده‌ی شما دست‌نخورده می‌ماند.'],
        },
        {
          id: 'undo',
          title: 'بازگرداندن آخرین اعمال (Undo)',
          intro: 'نظرتان عوض شد یا نتیجه درست نبود؟ عدد 3 را بزنید، ریپو را انتخاب کنید و فایل‌ها دقیقاً به حالت قبل برمی‌گردند.',
          steps: ['عدد 3 را بزنید و Enter کنید.', 'ریپو را مثل Apply انتخاب کنید.'],
          notes: ['اگر بعد از اعمال فایلی را ویرایش کرده باشید، Undo آن را بازنویسی نمی‌کند. در CLI فقط وقتی مطمئنید از --force استفاده کنید.'],
        },
        {
          id: 'manage',
          title: 'Projects، Settings و History',
          intro: 'پوشه‌هایتان را یک‌بار ذخیره کنید و بعد همه‌جا با نام انتخابشان کنید.',
          keys: [
            { t: '4', s: 'Projects: a پوشه اضافه می‌کند (می‌توانید preset بدهید: flutter، node، python) و d حذف می‌کند.' },
            { t: '5', s: 'Settings: شماره‌ی هر مورد را بزنید تا تغییر کند؛ مثلاً پوشه‌های ردشونده، حداکثر حجم فایل، اندازه‌ی تقسیم یا کپی در کلیپ‌بورد. r همه را به پیش‌فرض برمی‌گرداند.' },
            { t: '6', s: 'History: خروجی‌ها و اعمال‌های اخیر.' },
          ],
        },
        {
          id: 'cli',
          title: 'برای اسکریپت و کاربران حرفه‌ای',
          intro: 'هر کار منو یک دستور هم دارد. با codebridge --help همه را ببینید.',
          keys: [
            { t: 'codebridge context export --changed', s: 'فقط فایل‌های تغییرکرده را خروجی بگیرید.' },
            { t: 'codebridge patch apply fix.patch -r ./app', s: 'فایل Diff را روی یک ریپو اعمال کنید.' },
            { t: 'codebridge patch undo -r ./app', s: 'آخرین اعمال را برگردانید.' },
            { t: 'codebridge history -n 10', s: 'ده اجرای آخر را نشان بدهید.' },
          ],
          notes: ['دستورهای بیشتر در docs/USAGE.md در GitHub است.'],
        },
        {
          id: 'trouble',
          title: 'رفع مشکل‌های رایج',
          intro: 'پیام یا مشکل خود را در فهرست زیر پیدا کنید.',
          qa: [
            { t: 'Diff من هنگام Paste بریده می‌شود', s: 'Paste نکنید. Diff را کپی کنید (Ctrl+C)، گزینه‌ی 2 را بزنید و Enter کنید. از کلیپ‌بورد خوانده می‌شود.' },
            { t: '«Clipboard has no diff»', s: 'کل پاسخ AI یا کل بلوک Diff را دوباره کپی کنید و دوباره امتحان کنید. در لینوکس xclip، xsel یا wl-clipboard نصب کنید.' },
            { t: 'Diff اعمال نشد', s: 'هیچ چیز تغییر نکرده است. فایل codebridge-fix.txt را برای AI بفرستید و پاسخ جدیدش را اعمال کنید.' },
            { t: '«no terminal to confirm; re-run with -y»', s: 'این پیام فقط وقتی می‌آید که برنامه داخل ترمینال واقعی اجرا نشده باشد، مثلاً داخل یک اسکریپت. از ترمینال معمولی استفاده کنید یا -y بدهید.' },
            { t: '«Folder not found»', s: 'مسیر کامل را بنویسید، یا پروژه را یک‌بار در Projects (گزینه‌ی 4) ذخیره کنید و با شماره انتخاب کنید.' },
            { t: '«Pick at least one language»', s: 'یکی از حرف‌های a تا j (یا x برای زبان دلخواه) را بزنید و Enter کنید.' },
            { t: 'Git نصب نیست', s: 'Apply و Undo به Git نیاز دارند. آن را از git-scm.com نصب کنید و ترمینال را دوباره باز کنید.' },
            { t: 'مک اجازه‌ی باز کردن برنامه را نمی‌دهد', s: 'در پوشه‌ی بازشده این دستور را بزنید: xattr -d com.apple.quarantine ./codebridge' },
            { t: 'هشدار SmartScreen در ویندوز', s: 'More info و بعد Run anyway را بزنید. فایل اجرایی امضای دیجیتال ندارد.' },
          ],
        },
      ],
    },
    help: {
      title: 'کمک می‌خواهید؟',
      sub: 'راهنما شما را از نصب تا Undo می‌برد، با صفحه‌هایی که می‌توانید با آنچه می‌بینید مقایسه کنید.',
      items: [
        { t: 'خروجی در یک صفحه', s: 'کدام کلیدها را بزنید و هر گزینه چه می‌کند.' },
        { t: 'اعمال Diff پیشنهادی AI', s: 'کپی کنید، Enter بزنید، تمام. و اینکه چرا نباید Paste کنید.' },
        { t: 'مشکلی پیش آمد؟', s: 'راه‌حل کوتاه برای رایج‌ترین پیام‌ها.' },
      ],
      cta: 'باز کردن راهنمای کامل',
    },
  },
  ar: {
    metadata: {
      title: 'CodeBridge: تحويل الكود إلى سياق AI وأداة Git Diff',
      description:
        'حوّل ملف ZIP لمشروعك إلى سياق برمجي جاهز للذكاء الاصطناعي في المتصفح. طبّق تغييرات Git Diff التي ينشئها AI باستخدام تطبيق سطح المكتب. مجاني وخاص دون رفع ملفاتك.',
    },
    nav: { how: 'كيف يعمل', mobile: 'أندرويد وiOS', features: 'المزايا', trust: 'الخصوصية', web: 'أداة الويب', download: 'تحميل', theme: 'تبديل المظهر الفاتح أو الداكن', language: 'اللغة', skip: 'تخطَّ إلى المحتوى', guide: 'الدليل' },
    hero: {
      eyebrow: 'أداة للمطورين بمساعدة الذكاء الاصطناعي',
      title: 'أرسل للذكاء الاصطناعي كودًا نظيفًا،',
      titleAccent: 'وأعِد التغييرات دون نسخ ولصق.',
      sub: 'يحوّل CodeBridge مشروعك بأمان إلى نص من دون ملفات زائدة كي لا تُهدر الرموز، ويطبّق diff إجابة الذكاء الاصطناعي على مشروعك مباشرة. لن تحتاج بعد الآن إلى فتح الملفات والبحث عن الأسطر ونسخها واحدًا تلو الآخر.',
      ctaDownload: 'تحميل تطبيق سطح المكتب',
      ctaMobile: 'جرّبه في متصفح الهاتف أو الحاسوب',
      proof: ['لا يُرفع كودك', 'أندرويد وiOS والحاسوب', 'تراجع دقيق', 'مجاني ومفتوح المصدر'],
      previewLabel: 'مثال على تطبيق diff من إجابة الذكاء الاصطناعي',
      previewTitle: 'انسخ diff إجابة الذكاء الاصطناعي واضغط Enter',
      previewLines: [
        { text: '--- a/src/auth.py', kind: 'plain' },
        { text: '+++ b/src/auth.py', kind: 'plain' },
        { text: '- if token == None:', kind: 'removed' },
        { text: '+ if not token:', kind: 'added' },
        { text: '+ raise AuthError("missing token")', kind: 'added' },
      ],
      previewResult: 'طُبّقت التغييرات على 3 ملفات، من دون فتح مجلد',
      undo: 'تراجع',
    },
    mobile: {
      eyebrow: 'أندرويد وiOS',
      title: 'أرسل مصدر مشروعك إلى الذكاء الاصطناعي من هاتفك أيضًا',
      text: 'اختر ملف ZIP لمشروعك في متصفح الهاتف واحصل على نص جاهز للإرسال إلى الذكاء الاصطناعي. بلا تثبيت أو رفع أو بحث يدوي عن الملفات. كلما قلّ ما يصل إلى الذكاء الاصطناعي، قلّ استهلاك الرموز.',
      benefits: [
        'تُستبعد الملفات غير الضرورية والاعتماديات تلقائيًا',
        'تُحجب المفاتيح وكلمات المرور قبل الإرسال',
        'بلا إعدادات أمنية وبلا بحث يدوي عن الملفات',
      ],
      android: 'ابدأ من هاتف أندرويد',
      iphone: 'ابدأ من آيفون (iOS)',
      note: 'من دون تثبيت؛ مباشرة في متصفح الهاتف',
      project: 'مشروعك',
      files: [
        { path: 'node_modules/', status: 'حُذف', kind: 'removed' },
        { path: 'package-lock.json', status: 'حُذف', kind: 'removed' },
        { path: '.env', status: 'حُجب', kind: 'secret' },
        { path: 'src/', status: 'سيُرسل', kind: 'included' },
      ],
      ready: 'جاهز للإرسال إلى الذكاء الاصطناعي',
    },
    how: {
      title: 'في ثلاث خطوات، بلا تعقيد',
      steps: [
        { t: 'صدّر', s: 'تُستبعد ملفات ignore والاعتماديات وSVG وملفات lock والاختبارات تلقائيًا؛ ويبقى فقط ما يحتاجه الذكاء الاصطناعي.' },
        { t: 'اطلب diff', s: 'أرسل النص إلى الذكاء الاصطناعي واطلب منه إعادة التغييرات بصيغة diff فقط.' },
        { t: 'طبّق', s: 'انسخ diff واضغط Enter. تُطبّق التغييرات على المشروع مع snapshot وإمكانية تراجع دقيقة.' },
      ],
    },
    tool: {
      title: 'تحتاج إلى التصدير فقط؟ هنا، في المتصفح',
      sub: 'أسقط ملف ZIP واحصل على نص جاهز؛ بلا تثبيت أو رفع، على الهاتف والحاسوب. تطبيق diff والتراجع متاحان في تطبيق سطح المكتب.',
      choose: 'اختيار ZIP',
      chooseHint: 'من Files أو Drive أو Downloads',
      optGitignore: 'احترام .gitignore', optRedact: 'إخفاء الأسرار', optCompact: 'مضغوط', optHeader: 'تعليمات للذكاء الاصطناعي', optTree: 'شجرة الملفات',
      split: 'تقسيم التقرير', splitOff: 'من دون تقسيم',       pick: 'اختيار الملفات والمجلدات', pickCount: 'تم تحديد {a} من {b} ملف', dlgTitle: 'اختر ما يُضمَّن في التقرير', dlgHint: 'ألغِ تحديد مجلد أو ملف لاستبعاده من التقرير.', selAll: 'تحديد الكل', selNone: 'إلغاء تحديد الكل', done: 'تم', cancel: 'إلغاء', applyChanges: 'تأكيد وتطبيق التغييرات', pendChanges: 'بانتظار التأكيد: حذف {r} من التقرير، وإعادة {a}', pendNone: 'لا توجد تغييرات معلقة', hideTitle: 'إخفاء محتوى الملفات من التقرير (يبقى المسار)', hideImages: 'عدم عرض محتوى ملفات الصور (مثل SVG)', hideLocks: 'عدم عرض محتوى ملفات lock', projNone: 'غير محدد', lockHint: 'اختر نوع المشروع لتفعيل خياري lock والاختبارات.', projLabel: 'نوع المشروع', hideTests: 'عدم عرض محتوى ملفات الاختبار (test)', applying: 'جارٍ التطبيق…', applied: 'تم', pendOpts: 'تغيرت خيارات العرض', resSize: 'حجم التقرير: {size}', splitNote: 'لا يتجاوز كل جزء الحجم المختار. الملف الكبير جدًا يتابع في الجزء التالي.',
      convert: 'تحويل', convertAgain: 'تحويل مرة أخرى', working: 'قراءة {done} من {total}…',
      resFiles: '{n} ملف', resTokens: '≈ {n} رمز', resRedacted: 'تم إخفاء {n} سر', resSkipped: 'تم تخطي {n} (متجاهَل أو ثنائي أو كبير)',
            download: 'تحميل TXT', downloadPart: 'تحميل الجزء {n}', copy: 'نسخ', copyPart: 'نسخ الجزء {n}', copied: 'تم النسخ',
      errNotZip: 'لا يبدو هذا ملف ZIP.',
      errEmpty: 'لم يُعثر على ملفات نصية قابلة للقراءة. جرّب إيقاف .gitignore.',
      errRead: 'تعذّرت قراءة هذا الـ ZIP: {msg}',
      errBig: 'ملف ZIP كبير ({mb} ميغابايت): قد يكون بطيئًا على هذا الجهاز.',
    },
    features: {
      title: 'لماذا يهدر نسخ الكود يدويًا وقتك ورموزك؟',
      beforeTitle: 'من دون CodeBridge',
      beforeItems: [
        'يقول الذكاء الاصطناعي: «غيّر السطر 42».',
        'تفتح المجلد وتبحث عن الملف.',
        'تبحث عن السطر وتنسخه يدويًا، وهذه المرة في 10 ملفات.',
        'ولإرسال المشروع، تستبعد يدويًا node_modules وملفات lock وSVG، وإلا أُهدرت رموزك.',
      ],
      afterTitle: 'مع CodeBridge',
      afterItems: [
        'حوّل المشروع إلى نص بنقرة واحدة ومن دون ملفات زائدة',
        'اطلب من الذكاء الاصطناعي diff فقط',
        'أرسل diff ويطبّقه CodeBridge على المشروع',
        'هل أخطأت؟ أعد كل شيء بتراجع واحد',
      ],
    },
    privacy: {
      title: 'لماذا يمكن الوثوق بـ CodeBridge؟',
      items: [
        { t: 'تطبيق آمن', s: 'تُطبّق التغييرات ذريًا ولا تمس إلا ملفات التعديل نفسه.' },
        { t: 'تراجع دقيق', s: 'يُحفظ snapshot لكل عملية ويمكن التراجع عنها بالكامل.' },
        { t: 'إزالة الأسرار', s: 'تُحجب المفاتيح وكلمات المرور قبل إرسالها إلى الذكاء الاصطناعي.' },
        { t: 'محلي بالكامل', s: 'لا يُرفع شيء، ويعمل دون اتصال.' },
      ],
    },
    download: {
      eyebrow: 'مجاني · مفتوح المصدر · يعمل في كل مكان',
      title: 'اقضِ وقتك في القرارات القيّمة، لا في البحث بين الملفات',
      sub: 'فوّض CodeBridge الأعمال المتكررة في تجهيز الكود وتطبيقه؛ لتتفرغ للهندسة المعمارية والجودة والقرارات التي تضيف قيمة حقيقية إلى منتجك.',
      osPrompt: 'اختر نظام التشغيل للحصول على الإصدار المناسب',
      desktopNote: 'تطبيق سطح المكتب لتطبيق diff والتراجع. أتحتاج إلى التصدير فقط؟',
      browserCta: 'جرّب إصدار المتصفح على هاتفك أو حاسوبك',
      installMore: 'تثبيت تطبيق الويب',
      installTitle: 'تثبيت تطبيق سطح المكتب',
      installSteps: ['حمّل ملف ZIP المناسب لنظامك وفك ضغطه. لا حاجة إلى مثبّت.', 'شغّل الملف داخل المجلد: run.ps1 على ويندوز، وrun_macos.command على ماك، وrun.sh على لينكس.', 'تفتح القائمة في الطرفية. اكتب 1 لتصدير مشروع أو 2 لتطبيق diff.'],
      guideLink: 'اقرأ الدليل الكامل',
      pwaBadge: 'PWA · بلا متجر',
      pwaTitle: 'أندرويد وآيفون، تثبيت في ١٠ ثوانٍ',
      pwaText: 'أضفه إلى الشاشة الرئيسية. يفتح كتطبيق ويعمل دون إنترنت، وملفاتك لا تغادر هاتفك.',
      android: 'أندرويد', iphone: 'آيفون',
      steps: ['افتح هذه الصفحة في Chrome أو Safari', 'اضغط زر القائمة أو Share', 'اختر Add to Home Screen'],
      install: 'ثبّت على هذا الهاتف', installed: 'تم التثبيت',
      iosHint: 'على الآيفون استخدم Safari: اضغط Share ثم Add to Home Screen.',
      noPrompt: 'من قائمة المتصفح اختر Install app أو Add to Home Screen.',
      desktop: 'تطبيقات الحاسوب', win: 'ويندوز', mac: 'ماك', linux: 'لينكس', appleSilicon: 'Apple Silicon',
      note: 'يجب تثبيت Git لاستخدام ميزات التعديلات.',
      winHint: 'عند التشغيل أول مرة، قد يحذّر SmartScreen لأن الملف غير موقّع. اختر More info ثم Run anyway.',
      macHint: 'عند التشغيل أول مرة، انقر بزر الفأرة الأيمن على run_macos.command واختر Open، أو نفّذ `xattr -d com.apple.quarantine ./codebridge`. أجهزة Intel Mac غير مدعومة.',
      linuxHint: 'عند الحاجة، نفّذ `chmod +x codebridge run.sh` قبل التشغيل.',
      releaseChecksums: 'المجاميع الاختبارية والمصدر على GitHub',
      installNotes: 'ملاحظات التشغيل',
      recommended: 'موصى به', hintDefault: 'اختر الحزمة المناسبة لنظامك.', hintMobile: 'تطبيقات سطح المكتب مخصصة للحواسيب. على الهاتف ثبّت تطبيق الويب في الأسفل.', downloadFor: 'تحميل لنظام {os}', dlAria: '{label}، {arch}، {format}', relVersion: 'إصدار التطبيق: {v}', relPublished: 'نُشر في {date}',
    },
    footer: { license: 'رخصة MIT', tagline: 'CodeBridge · أداة مجانية ومفتوحة المصدر للعمل مع الذكاء الاصطناعي', developer: 'المطوّر', developerName: 'إسماعيل أحمدي‌پور' },
    guide: {
      metadata: { title: 'دليل CodeBridge: تصدير الكود وتطبيق Git Diff', description: 'تعلّم كيفية تصدير مشروعك للذكاء الاصطناعي، وتطبيق تغييرات Git Diff بأمان، والتراجع عنها، وحل المشكلات الشائعة في تطبيق CodeBridge.' },
      eyebrow: 'الدليل · تطبيق سطح المكتب {version}',
      title: 'تعلّم CodeBridge في 5 دقائق',
      sub: 'صدّر مشروعك للذكاء الاصطناعي، وطبّق رده بأمان، وتراجع عند الحاجة. الشاشات أدناه هي ما تراه فعلًا في التطبيق.',
      toc: 'في هذه الصفحة',
      home: 'العودة إلى الرئيسية',
      shotLabel: 'مثال على ما تراه في الطرفية',
      sections: [
        {
          id: 'install',
          title: 'التثبيت والتشغيل',
          intro: 'حمّل ملف ZIP المناسب لنظامك من صفحة Releases، وفك ضغطه وشغّل المُشغِّل. لا مثبّت ولا Python. يجب تثبيت Git لتطبيق التعديلات.',
          steps: ['حمّل ملف ZIP المناسب لنظامك من صفحة Releases وفك ضغطه.', 'شغّل المُشغِّل: run.sh على لينكس، وrun_macos.command على ماك، وrun.ps1 على ويندوز.', 'تفتح القائمة. اكتب رقمًا ثم اضغط Enter.'],
          notes: ['أول تشغيل على ماك: نفّذ سطر xattr مرة واحدة لأن التطبيق غير موقّع.', 'قد يعرض ويندوز تحذير SmartScreen: اختر More info ثم Run anyway.'],
        },
        {
          id: 'menu',
          title: 'القائمة الرئيسية',
          intro: 'اكتب رقم ما تريده ثم اضغط Enter. اكتب 0 للخروج.',
          keys: [
            { t: '1', s: 'Export: ينشئ الملف النصي الذي تعطيه للذكاء الاصطناعي.' },
            { t: '2', s: 'Apply: يطبّق تعديلات الذكاء الاصطناعي (diff) على مشروعك.' },
            { t: '3', s: 'Undo: يستعيد ملفات آخر تطبيق.' },
            { t: '4', s: 'Projects: يحفظ المجلدات لتختارها بالاسم.' },
            { t: '5', s: 'Settings: يغيّر الإعدادات الافتراضية مثل المجلدات المستبعدة.' },
            { t: '6', s: 'History: يعرض آخر عمليات التصدير والتطبيق.' },
            { t: '0', s: 'خروج.' },
          ],
        },
        {
          id: 'export',
          title: 'تصدير قاعدة الشيفرة كسياق للذكاء الاصطناعي',
          intro: 'كل شيء في صفحة واحدة. حدّد ما تريد ثم اضغط Enter. الضغط على Enter وحده يصدّر ما تراه تمامًا.',
          steps: ['اختر المشروع أولًا: اكتب p ثم اختره من القائمة أو اكتب مجلده.', 'اكتب المفاتيح مفصولة بمسافات، مثل «3 s t»: مشروع Next.js مع محتوى SVG ومع ملفات الاختبار. كتابة المفتاح مرة أخرى تلغيه.', 'اقرأ سطر «Will export» فوق الإطار ثم اضغط Enter على سطر فارغ.'],
          keys: [
            { t: '1-6', s: 'نوع المشروع (واحد). تغييره يعيد اللغات إلى افتراضيات ذلك النوع.' },
            { t: 'a-j', s: 'تشغيل اللغات أو إيقافها.' },
            { t: 'x', s: 'إضافة لغة مخصصة، مثل lua.' },
            { t: 's', s: 'تضمين محتوى ملفات SVG.' },
            { t: 'l', s: 'استبعاد ملفات lock مثل package-lock.json وpubspec.lock.' },
            { t: 't', s: 'استبعاد ملفات ومجلدات الاختبار.' },
            { t: 'o', s: 'الملفات المتغيرة في git فقط.' },
            { t: 'p', s: 'اختيار مشروع آخر.' },
            { t: 'q', s: 'إلغاء والعودة.' },
          ],
          notes: ['الأسرار تُخفى دائمًا في التقرير. ومع ذلك راجعه قبل مشاركته.', 'يُحفظ التقرير باسم code_report_<project>.txt في المجلد الذي شغّلت منه التطبيق. أعطِ هذا الملف للذكاء الاصطناعي.', 'تُحفظ اختياراتك للتصدير التالي.'],
        },
        {
          id: 'apply',
          title: 'تطبيق Git Diff مُنشأ بواسطة الذكاء الاصطناعي',
          intro: 'اطلب من الذكاء الاصطناعي أن يرد بصيغة git diff. ثم يضعه CodeBridge في مشروعك بأمان: يفحص كل شيء أولًا ولا يغيّر شيئًا إذا فشل أي جزء.',
          steps: ['انسخ الـ diff كاملًا من رد الذكاء الاصطناعي بـ Ctrl+C (أو بزر النسخ).', 'في CodeBridge اكتب 2 ثم Enter، واختر المستودع: Enter يختار أول عنصر في القائمة، أو اكتب رقمًا أو اسمًا أو مجلدًا.', 'عندما يطلب ذلك اضغط Enter. يُقرأ الـ diff من الحافظة. لا تلصقه في الطرفية: اللصق متعدد الأسطر يُقطع بعد السطر الأول.', 'راجع قائمة الملفات وأكّد، وانتهى الأمر.'],
          notes: ['إذا لم يُطبَّق الـ diff لا يتغير شيء ويكتب التطبيق الملف codebridge-fix.txt (ويُنسخ إلى الحافظة). أرسله إلى الذكاء الاصطناعي.', 'يجب تثبيت Git. أعمالك غير المُثبَّتة (uncommitted) تبقى كما هي.'],
        },
        {
          id: 'undo',
          title: 'التراجع عن آخر تطبيق',
          intro: 'غيّرت رأيك أو النتيجة خاطئة؟ اكتب 3 واختر المستودع وتعود الملفات كما كانت تمامًا.',
          steps: ['اكتب 3 ثم Enter.', 'اختر المستودع بالطريقة نفسها كما في Apply.'],
          notes: ['إذا عدّلت ملفًا بعد التطبيق يرفض التراجع الكتابة فوقه. في CLI استخدم --force فقط إذا كنت متأكدًا.'],
        },
        {
          id: 'manage',
          title: 'Projects وSettings وHistory',
          intro: 'احفظ مجلداتك مرة واحدة ثم اخترها بالاسم في كل مكان.',
          keys: [
            { t: '4', s: 'Projects: الحرف a يضيف مجلدًا (مع preset اختياري: flutter أو node أو python) وd يحذف.' },
            { t: '5', s: 'Settings: اكتب رقم العنصر لتغييره، مثل المجلدات المستبعدة أو الحد الأقصى لحجم الملف أو حجم التقسيم أو النسخ إلى الحافظة. الحرف r يعيد كل شيء للافتراضي.' },
            { t: '6', s: 'History: آخر عمليات التصدير والتطبيق.' },
          ],
        },
        {
          id: 'cli',
          title: 'للسكربتات والمستخدمين المتقدمين',
          intro: 'كل إجراء في القائمة له أمر أيضًا. شغّل codebridge --help لرؤيتها كلها.',
          keys: [
            { t: 'codebridge context export --changed', s: 'تصدير الملفات المتغيرة فقط.' },
            { t: 'codebridge patch apply fix.patch -r ./app', s: 'تطبيق ملف diff على مستودع.' },
            { t: 'codebridge patch undo -r ./app', s: 'التراجع عن آخر تطبيق.' },
            { t: 'codebridge history -n 10', s: 'عرض آخر 10 عمليات.' },
          ],
          notes: ['المزيد من الأوامر في docs/USAGE.md على GitHub.'],
        },
        {
          id: 'trouble',
          title: 'إصلاح المشكلات الشائعة',
          intro: 'ابحث عن رسالتك أو مشكلتك أدناه.',
          qa: [
            { t: 'يُقطع الـ diff عند اللصق', s: 'لا تلصق. انسخ الـ diff (Ctrl+C) واختر 2 ثم اضغط Enter. يُقرأ من الحافظة.' },
            { t: '«Clipboard has no diff»', s: 'انسخ رد الذكاء الاصطناعي كاملًا أو كتلة الـ diff كاملة مرة أخرى وأعد المحاولة. على لينكس ثبّت xclip أو xsel أو wl-clipboard.' },
            { t: 'فشل تطبيق الـ diff', s: 'لم يتغير شيء. أرسل codebridge-fix.txt إلى الذكاء الاصطناعي وطبّق إجابته الجديدة.' },
            { t: '«no terminal to confirm; re-run with -y»', s: 'تظهر فقط عندما لا يعمل التطبيق في طرفية حقيقية، مثل داخل سكربت. استخدم طرفية عادية أو أضف -y.' },
            { t: '«Folder not found»', s: 'اكتب المسار الكامل، أو احفظ المشروع مرة في Projects (الخيار 4) واختره بالرقم.' },
            { t: '«Pick at least one language»', s: 'اضغط حرفًا من a إلى j (أو x للغة مخصصة) ثم Enter.' },
            { t: 'Git غير مثبّت', s: 'يحتاج Apply وUndo إلى Git. ثبّته من git-scm.com وأعد فتح الطرفية.' },
            { t: 'ماك لا يفتح التطبيق', s: 'في المجلد بعد فك الضغط نفّذ: xattr -d com.apple.quarantine ./codebridge' },
            { t: 'تحذير SmartScreen في ويندوز', s: 'اختر More info ثم Run anyway. الملف التنفيذي غير موقّع رقميًا.' },
          ],
        },
      ],
    },
    help: {
      title: 'تحتاج مساعدة؟',
      sub: 'يأخذك الدليل من التثبيت حتى التراجع، مع شاشات يمكنك مقارنتها بما تراه.',
      items: [
        { t: 'التصدير في شاشة واحدة', s: 'أي المفاتيح تضغط وماذا يفعل كل خيار.' },
        { t: 'تطبيق diff من الذكاء الاصطناعي', s: 'انسخ ثم اضغط Enter وانتهى. ولماذا لا يجب أن تلصق.' },
        { t: 'حدثت مشكلة؟', s: 'حلول قصيرة لأكثر الرسائل شيوعًا.' },
      ],
      cta: 'افتح الدليل الكامل',
    },
  },
};
