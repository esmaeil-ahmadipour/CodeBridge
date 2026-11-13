import type { MetadataRoute } from 'next';
import { localePrefix, locales } from '@/i18n/config';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (l: (typeof locales)[number], path = '') =>
    `${siteUrl}${localePrefix(l)}${path}`;

  const languageAlternates = (path: string) => ({
    ...Object.fromEntries(locales.map((locale) => [locale, url(locale, path)])),
    'x-default': url('en', path),
  });

  return ['', '/guide'].flatMap((path) =>
    locales.map((l) => ({
      url: url(l, path),
      alternates: {
        languages: languageAlternates(path),
      },
    })),
  );
}
