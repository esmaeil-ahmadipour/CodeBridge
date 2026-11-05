export type Locale = 'en' | 'fa' | 'ar';

export const locales: readonly Locale[] = ['en', 'fa', 'ar'];
export const defaultLocale: Locale = 'en';

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);
export const isRtlLocale = (locale: Locale) => locale === 'fa' || locale === 'ar';

/** '' for the default locale (unprefixed URLs), '/fa' / '/ar' otherwise. */
export const localePrefix = (locale: Locale) => (locale === defaultLocale ? '' : `/${locale}`);
export const stripLocale = (pathname: string) => pathname.replace(/^\/(?:en|fa|ar)(?=\/|$)/, '') || '/';
export const localizePath = (pathname: string, locale: Locale) => {
  const path = stripLocale(pathname);
  return path === '/' ? localePrefix(locale) || '/' : `${localePrefix(locale)}${path}`;
};
