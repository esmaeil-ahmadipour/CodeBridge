import type { MetadataRoute } from 'next';
import { localePrefix, locales } from '@/i18n/config';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (l: (typeof locales)[number]) => `${siteUrl}${localePrefix(l)}` || siteUrl;
  return locales.map((l) => ({
    url: url(l),
    lastModified: new Date(),
    alternates: { languages: Object.fromEntries(locales.map((x) => [x, url(x)])) },
  }));
}
