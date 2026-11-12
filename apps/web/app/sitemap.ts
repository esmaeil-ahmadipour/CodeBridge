import type { MetadataRoute } from 'next';
import { localePrefix, locales } from '@/i18n/config';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (l: (typeof locales)[number], path = '') => `${siteUrl}${localePrefix(l)}${path}` || siteUrl;
  return ['', '/guide'].flatMap((path) =>
    locales.map((l) => ({
      url: url(l, path),
      lastModified: new Date(),
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, url(x, path)])) },
    })),
  );
}
