// Launch switches. NEXT_PUBLIC_* values are inlined at build time: change the value, then rebuild.
export const flags = {
  // Desktop downloads + PWA install section, its nav link and hero button.
  downloads: process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS !== 'false',
} as const;
