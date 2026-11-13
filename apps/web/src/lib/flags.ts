// Launch switches. NEXT_PUBLIC_* values are inlined at build time: change the value, then rebuild.
export const flags = {
  // Desktop downloads + PWA install section, its nav button and hero button. On by default;
  // set NEXT_PUBLIC_ENABLE_DOWNLOADS=false to hide them (for example before the first release exists).
  downloads: process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS !== 'false',
} as const;
