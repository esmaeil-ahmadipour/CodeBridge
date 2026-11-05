import type { Locale } from './config';

interface Pair { t: string; s: string }

export interface Dictionary {
  metadata: { title: string; description: string };
  nav: { tryIt: string; privacy: string; download: string; theme: string; language: string; skip: string };
  hero: { eyebrow: string; title: string; sub: string; ctaTry: string; ctaPrivacy: string; ctaDownload: string; proof: string[]; soon: string; previewLabel: string };
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
  privacy: { badge: string; title: string; text: string; flowLabel: string; flow: string[]; deviceLabel: string; blocked: string; points: Pair[]; note: string };
  features: { title: string; sub: string; example: string; items: Pair[]; itemsWeb: Pair[] };
  download: {
    eyebrow: string; title: string; sub: string; pwaBadge: string; pwaTitle: string; pwaText: string;
    android: string; iphone: string; steps: string[]; install: string; installed: string; iosHint: string; noPrompt: string;
    desktop: string; win: string; winSub: string; mac: string; macSub: string; linux: string; linuxSub: string; note: string;
    recommended: string; hintDefault: string; hintDetected: string; hintMobile: string; downloadFor: string; dlAria: string;
    relVersion: string; relPublished: string; relNotes: string; relFallback: string;
  };
  footer: { license: string; tagline: string };
}

export const translations: Record<Locale, Dictionary> = {
  en: {
    metadata: {
      title: 'CodeBridge: turn any project into AI-ready text, privately',
      description:
        'Convert a project ZIP into one clean text file for any AI, right in your browser. Free, private, and nothing is uploaded.',
    },
    nav: { tryIt: 'Try it', privacy: 'Privacy', download: 'Download', theme: 'Switch light or dark theme', language: 'Language', skip: 'Skip to content' },
    hero: {
      eyebrow: 'Free · Private · In your browser',
      title: 'Turn your project into AI-ready text. Privately.',
      sub: 'Drop a ZIP, choose what to include, and get one clean text file for any AI. Everything runs on your device, so your code is never uploaded.',
      ctaTry: 'Try it now: choose a ZIP',
      ctaPrivacy: 'How it stays private',
      ctaDownload: 'Get the desktop app',
      proof: ['Nothing uploaded', 'Works offline', 'Free & open source'],
      soon: 'Desktop app with safe apply and undo: coming soon.',
      previewLabel: 'Example of a generated report',
    },
    tool: {
      title: 'ZIP to AI-ready text',
      sub: 'Runs on your device. Your files are never uploaded.',
      choose: 'Choose a project ZIP',
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
    privacy: {
      badge: 'Private by design',
      title: 'Your code never leaves your device',
      text: 'There is no upload step and no server that could receive, store or leak your files. The whole conversion runs inside your browser.',
      flowLabel: 'Your ZIP is processed on your device and never reaches a server',
      flow: ['Your ZIP', 'Your browser', 'Your TXT', 'Server'],
      deviceLabel: 'On your device',
      blocked: 'No connection',
      points: [
        { t: 'Nothing is uploaded', s: 'Your browser blocks this page from contacting other servers. Open DevTools → Network and watch.' },
        { t: 'Works offline', s: 'Load the page once, switch to airplane mode, and it still converts.' },
        { t: 'No account, no file tracking', s: 'We never see the names, contents or sizes of your files.' },
        { t: 'Open source', s: 'Read every line yourself and verify these claims.' },
      ],
      note: 'Secret masking is best-effort. Skim a report before you share it.',
    },
    features: {
      title: 'Send the AI only what matters',
      sub: 'Smaller, safer reports that fit any AI.',
      example: 'Example',
      items: [
        { t: 'Safe apply', s: 'All-or-nothing patches, tolerant of AI mistakes, with exact undo.' },
        { t: 'Fewer tokens', s: 'Send only changed files and skip lockfiles and generated code.' },
        { t: 'Fix loop', s: 'If a patch fails, get a ready prompt with the errors and current code.' },
      ],
      itemsWeb: [
        { t: 'Fewer tokens, sharper answers', s: 'Skip lockfiles, tests, images and anything you untick, so the AI sees only what matters.' },
        { t: 'Secrets masked', s: 'Common keys and tokens are hidden automatically. Still skim a report before sharing it.' },
        { t: 'Fits any AI', s: 'Split the report into parts from 200 KB to 10 MB to match your AI’s limit.' },
      ],
    },
    download: {
      eyebrow: 'Free · Open source · Works everywhere',
      title: 'Take it anywhere',
      sub: 'Phone, tablet or desktop. Pick how you like to work.',
      pwaBadge: 'PWA · No store needed',
      pwaTitle: 'Android & iPhone, installed in 10 seconds',
      pwaText: 'Add it to your Home Screen. It opens like an app, works offline, and your files never leave your phone.',
      android: 'Android', iphone: 'iPhone',
      steps: ['Open this page in Chrome or Safari', 'Tap the menu or Share button', 'Choose Add to Home Screen'],
      install: 'Install on this phone', installed: 'Installed',
      iosHint: 'On iPhone use Safari: tap Share, then Add to Home Screen.',
      noPrompt: 'Use your browser menu and choose Install app or Add to Home Screen.',
      desktop: 'Desktop apps', win: 'Windows', winSub: 'Windows 10 or later · unzip and run, no install', mac: 'macOS', macSub: 'Apple Silicon (M1 or newer) only', linux: 'Linux', linuxSub: 'Built on Ubuntu 22.04 · unzip and run',
      note: 'Checksums and source on GitHub · Git needed for patch features',
      recommended: 'Recommended for you', hintDefault: 'Choose the package for your system.', hintDetected: '{os} detected. Your recommended download is highlighted.', hintMobile: 'Desktop apps are for computers. On a phone, install the web app below.', downloadFor: 'Download for {os}', dlAria: '{label}, {arch}, {format}', relVersion: 'Latest release: {v}', relPublished: 'Published {date}', relNotes: 'Release notes and all assets', relFallback: 'Release notes and all assets on GitHub',
    },
    footer: { license: 'MIT licensed · Made by Esmaeil Ahmadipour', tagline: 'Free, private and open source. Your code stays on your device.' },
  },
  fa: {
    metadata: {
      title: 'CodeBridge: هر پروژه را خصوصی به متن آماده‌ی هوش مصنوعی تبدیل کنید',
      description:
        'ZIP پروژه را همین‌جا در مرورگر به یک فایل متنی مرتب برای هر هوش مصنوعی تبدیل کنید. رایگان و خصوصی است و هیچ‌چیز آپلود نمی‌شود.',
    },
    nav: { tryIt: 'امتحان کنید', privacy: 'حریم خصوصی', download: 'دانلود', theme: 'تغییر تم روشن یا تاریک', language: 'زبان', skip: 'رفتن به محتوا' },
    hero: {
      eyebrow: 'رایگان · خصوصی · داخل مرورگر',
      title: 'پروژه‌تان را به متن آماده‌ی هوش مصنوعی تبدیل کنید. کاملاً خصوصی.',
      sub: 'ZIP پروژه را بیندازید، انتخاب کنید چه چیزی وارد شود و یک فایل متنی مرتب برای هر هوش مصنوعی بگیرید. همه‌چیز روی دستگاه شما اجرا می‌شود و کدتان هرگز آپلود نمی‌شود.',
      ctaTry: 'همین حالا امتحان کنید: انتخاب ZIP',
      ctaPrivacy: 'چطور خصوصی می‌ماند',
      ctaDownload: 'دریافت اپ دسکتاپ',
      proof: ['چیزی آپلود نمی‌شود', 'آفلاین هم کار می‌کند', 'رایگان و متن‌باز'],
      soon: 'اپ دسکتاپ با اعمال امن و Undo: به‌زودی.',
      previewLabel: 'نمونه‌ای از گزارش ساخته‌شده',
    },
    tool: {
      title: 'ZIP به متن آماده‌ی AI',
      sub: 'روی دستگاه خودتان اجرا می‌شود. فایل‌هایتان هرگز آپلود نمی‌شوند.',
      choose: 'انتخاب ZIP پروژه',
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
    privacy: {
      badge: 'حریم خصوصی از پایه',
      title: 'کد شما هرگز از دستگاهتان بیرون نمی‌رود',
      text: 'مرحله‌ی آپلود وجود ندارد و سروری هم نیست که فایل‌هایتان را دریافت، ذخیره یا فاش کند. کل تبدیل داخل مرورگر شما انجام می‌شود.',
      flowLabel: 'ZIP شما روی دستگاهتان پردازش می‌شود و هرگز به سرور نمی‌رسد',
      flow: ['ZIP شما', 'مرورگر شما', 'TXT شما', 'سرور'],
      deviceLabel: 'روی دستگاه شما',
      blocked: 'بدون ارتباط',
      points: [
        { t: 'چیزی آپلود نمی‌شود', s: 'مرورگر اجازه نمی‌دهد این صفحه با سرور دیگری ارتباط بگیرد. DevTools را باز کنید، به تب Network بروید و خودتان ببینید.' },
        { t: 'آفلاین هم کار می‌کند', s: 'صفحه را یک‌بار باز کنید و حالت پرواز را روشن کنید؛ باز هم تبدیل می‌کند.' },
        { t: 'بدون حساب، بدون ردیابی فایل', s: 'نام، محتوا و حجم فایل‌های شما را هرگز نمی‌بینیم.' },
        { t: 'متن‌باز', s: 'کد را خودتان بخوانید و این ادعاها را بسنجید.' },
      ],
      note: 'پنهان‌سازی رمزها در حد توان است؛ پیش از اشتراک‌گذاری، گزارش را مرور کنید.',
    },
    features: {
      title: 'فقط آنچه مهم است را برای AI بفرستید',
      sub: 'گزارش‌های کوچک‌تر و امن‌تر که در هر AI جا می‌شوند.',
      example: 'نمونه',
      items: [
        { t: 'اعمال امن', s: 'Patch یا کامل اعمال می‌شود یا هیچ؛ در برابر اشتباه AI مقاوم است و Undo دقیق دارد.' },
        { t: 'توکن کمتر', s: 'فقط فایل‌های تغییرکرده را بفرستید و lockfile و کد تولیدشده را کنار بگذارید.' },
        { t: 'حلقه‌ی رفع خطا', s: 'اگر Patch شکست خورد، پرامپت آماده با خطاها و کد فعلی می‌گیرید.' },
      ],
      itemsWeb: [
        { t: 'توکن کمتر، پاسخ دقیق‌تر', s: 'فایل‌های lock، تست، تصویر و هر چیزی که تیکش را بردارید کنار می‌رود؛ AI فقط همان را می‌بیند که مهم است.' },
        { t: 'رمزها پنهان می‌شوند', s: 'کلیدها و توکن‌های رایج خودکار پوشانده می‌شوند. باز هم پیش از اشتراک‌گذاری گزارش را مرور کنید.' },
        { t: 'در هر AI جا می‌شود', s: 'گزارش را به بخش‌های ۲۰۰ کیلوبایت تا ۱۰ مگابایت تقسیم کنید تا با محدودیت AI شما جور شود.' },
      ],
    },
    download: {
      eyebrow: 'رایگان · متن‌باز · همه‌جا',
      title: 'همه‌جا همراه شما',
      sub: 'گوشی، تبلت یا دسکتاپ. هر طور راحت‌ترید کار کنید.',
      pwaBadge: 'PWA · بدون نیاز به استور',
      pwaTitle: 'اندروید و آیفون، نصب در ۱۰ ثانیه',
      pwaText: 'آن را به صفحه‌ی اصلی اضافه کنید. مثل اپ باز می‌شود، آفلاین کار می‌کند و فایل‌هایتان از گوشی بیرون نمی‌رود.',
      android: 'اندروید', iphone: 'آیفون',
      steps: ['این صفحه را در Chrome یا Safari باز کنید', 'دکمه‌ی منو یا Share را بزنید', 'Add to Home Screen را انتخاب کنید'],
      install: 'نصب روی این گوشی', installed: 'نصب شده',
      iosHint: 'در آیفون از Safari استفاده کنید: Share و سپس Add to Home Screen.',
      noPrompt: 'از منوی مرورگر، Install app یا Add to Home Screen را انتخاب کنید.',
      desktop: 'اپ‌های دسکتاپ', win: 'ویندوز', winSub: 'ویندوز ۱۰ یا بالاتر · بازکردن ZIP و اجرا، بدون نصب', mac: 'مک', macSub: 'فقط Apple Silicon (M1 یا جدیدتر)', linux: 'لینوکس', linuxSub: 'ساخته‌شده روی Ubuntu 22.04 · بازکردن ZIP و اجرا',
      note: 'Checksum و سورس در GitHub · قابلیت‌های Patch به Git نیاز دارند',
      recommended: 'پیشنهاد برای شما', hintDefault: 'بسته‌ی مناسب سیستم خود را انتخاب کنید.', hintDetected: '{os} شناسایی شد. دانلود پیشنهادی شما مشخص شده است.', hintMobile: 'اپ‌های دسکتاپ برای کامپیوتر هستند. روی گوشی، نسخه‌ی وب را در پایین نصب کنید.', downloadFor: 'دانلود برای {os}', dlAria: '{label}، {arch}، {format}', relVersion: 'آخرین نسخه: {v}', relPublished: 'منتشرشده در {date}', relNotes: 'یادداشت‌های نسخه و همه‌ی فایل‌ها', relFallback: 'یادداشت‌های نسخه و همه‌ی فایل‌ها در GitHub',
    },
    footer: { license: 'مجوز MIT · ساخته‌ی اسماعیل احمدی‌پور', tagline: 'رایگان، خصوصی و متن‌باز. کد شما روی دستگاه خودتان می‌ماند.' },
  },
  ar: {
    metadata: {
      title: 'CodeBridge: حوّل أي مشروع إلى نص جاهز للذكاء الاصطناعي بخصوصية تامة',
      description:
        'حوّل ملف ZIP للمشروع إلى ملف نصي منظم لأي ذكاء اصطناعي، داخل متصفحك مباشرة. مجاني وخاص ولا يُرفع شيء.',
    },
    nav: { tryIt: 'جرّبه', privacy: 'الخصوصية', download: 'تحميل', theme: 'تبديل المظهر الفاتح أو الداكن', language: 'اللغة', skip: 'تخطَّ إلى المحتوى' },
    hero: {
      eyebrow: 'مجاني · خاص · داخل المتصفح',
      title: 'حوّل مشروعك إلى نص جاهز للذكاء الاصطناعي. بخصوصية تامة.',
      sub: 'أسقط ملف ZIP، واختر ما يُضمَّن، واحصل على ملف نصي منظم لأي ذكاء اصطناعي. كل شيء يعمل على جهازك، فلا يُرفع كودك أبدًا.',
      ctaTry: 'جرّبه الآن: اختر ملف ZIP',
      ctaPrivacy: 'كيف تبقى بياناتك خاصة',
      ctaDownload: 'احصل على تطبيق سطح المكتب',
      proof: ['لا شيء يُرفع', 'يعمل دون اتصال', 'مجاني ومفتوح المصدر'],
      soon: 'تطبيق سطح المكتب مع التطبيق الآمن والتراجع: قريبًا.',
      previewLabel: 'مثال على تقرير مُنشأ',
    },
    tool: {
      title: 'من ZIP إلى نص جاهز للذكاء الاصطناعي',
      sub: 'يعمل على جهازك. ملفاتك لا تُرفع أبدًا.',
      choose: 'اختر ملف ZIP للمشروع',
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
    privacy: {
      badge: 'خصوصية بالتصميم',
      title: 'كودك لا يغادر جهازك أبدًا',
      text: 'لا توجد خطوة رفع ولا خادم يمكنه استلام ملفاتك أو تخزينها أو تسريبها. التحويل كله يتم داخل متصفحك.',
      flowLabel: 'تتم معالجة ملف ZIP على جهازك ولا يصل إلى أي خادم',
      flow: ['ملف ZIP الخاص بك', 'متصفحك', 'ملف TXT الخاص بك', 'الخادم'],
      deviceLabel: 'على جهازك',
      blocked: 'لا اتصال',
      points: [
        { t: 'لا شيء يُرفع', s: 'يمنع المتصفح هذه الصفحة من الاتصال بأي خادم آخر. افتح DevTools ثم تبويب Network وشاهد بنفسك.' },
        { t: 'يعمل دون اتصال', s: 'حمّل الصفحة مرة واحدة ثم فعّل وضع الطيران، وسيظل التحويل يعمل.' },
        { t: 'بلا حساب ولا تتبّع للملفات', s: 'لا نرى أبدًا أسماء ملفاتك أو محتواها أو أحجامها.' },
        { t: 'مفتوح المصدر', s: 'اقرأ الكود بنفسك وتحقق من هذه الادعاءات.' },
      ],
      note: 'إخفاء الأسرار بأفضل جهد؛ راجع التقرير قبل مشاركته.',
    },
    features: {
      title: 'أرسل للذكاء الاصطناعي ما يهم فقط',
      sub: 'تقارير أصغر وأكثر أمانًا تناسب أي ذكاء اصطناعي.',
      example: 'مثال',
      items: [
        { t: 'تطبيق آمن', s: 'تُطبَّق التعديلات كاملة أو لا تُطبَّق، مع تسامح مع أخطاء الذكاء الاصطناعي وتراجع دقيق.' },
        { t: 'رموز أقل', s: 'أرسل الملفات المتغيرة فقط وتجاهل ملفات القفل والشيفرة المولَّدة.' },
        { t: 'حلقة الإصلاح', s: 'إذا فشل التطبيق، تحصل على مطالبة جاهزة بالأخطاء والشيفرة الحالية.' },
      ],
      itemsWeb: [
        { t: 'رموز أقل، إجابات أدق', s: 'تُستبعد ملفات lock والاختبارات والصور وكل ما تلغي تحديده، فيرى الذكاء الاصطناعي ما يهم فقط.' },
        { t: 'إخفاء الأسرار', s: 'تُحجب المفاتيح والرموز الشائعة تلقائيًا. ومع ذلك راجع التقرير قبل مشاركته.' },
        { t: 'يناسب أي ذكاء اصطناعي', s: 'قسّم التقرير إلى أجزاء من 200 كيلوبايت إلى 10 ميغابايت لتناسب حدود الذكاء الاصطناعي لديك.' },
      ],
    },
    download: {
      eyebrow: 'مجاني · مفتوح المصدر · يعمل في كل مكان',
      title: 'خذه معك أينما ذهبت',
      sub: 'هاتف أو لوحي أو حاسوب. اختر ما يناسبك.',
      pwaBadge: 'PWA · بلا متجر',
      pwaTitle: 'أندرويد وآيفون، تثبيت في ١٠ ثوانٍ',
      pwaText: 'أضفه إلى الشاشة الرئيسية. يفتح كتطبيق ويعمل دون إنترنت، وملفاتك لا تغادر هاتفك.',
      android: 'أندرويد', iphone: 'آيفون',
      steps: ['افتح هذه الصفحة في Chrome أو Safari', 'اضغط زر القائمة أو Share', 'اختر Add to Home Screen'],
      install: 'ثبّت على هذا الهاتف', installed: 'تم التثبيت',
      iosHint: 'على الآيفون استخدم Safari: اضغط Share ثم Add to Home Screen.',
      noPrompt: 'من قائمة المتصفح اختر Install app أو Add to Home Screen.',
      desktop: 'تطبيقات الحاسوب', win: 'ويندوز', winSub: 'ويندوز 10 أو أحدث · فك الضغط والتشغيل دون تثبيت', mac: 'ماك', macSub: 'لأجهزة Apple Silicon (M1 أو أحدث) فقط', linux: 'لينكس', linuxSub: 'مبني على Ubuntu 22.04 · فك الضغط والتشغيل',
      note: 'المجاميع الاختبارية والمصدر على GitHub · ميزات التعديل تحتاج Git',
      recommended: 'موصى به لك', hintDefault: 'اختر الحزمة المناسبة لنظامك.', hintDetected: 'تم اكتشاف {os}. التنزيل الموصى به مميّز.', hintMobile: 'تطبيقات سطح المكتب مخصصة للحواسيب. على الهاتف ثبّت تطبيق الويب في الأسفل.', downloadFor: 'تحميل لنظام {os}', dlAria: '{label}، {arch}، {format}', relVersion: 'أحدث إصدار: {v}', relPublished: 'نُشر في {date}', relNotes: 'ملاحظات الإصدار وكل الملفات', relFallback: 'ملاحظات الإصدار وكل الملفات على GitHub',
    },
    footer: { license: 'رخصة MIT · من تطوير إسماعيل أحمدي‌پور', tagline: 'مجاني وخاص ومفتوح المصدر. يبقى كودك على جهازك.' },
  },
};
