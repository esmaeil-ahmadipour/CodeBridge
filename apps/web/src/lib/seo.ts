import type { Metadata } from 'next';
import { defaultLocale, localePrefix, locales, type Locale } from '@/i18n/config';
import { translations } from '@/i18n/translations';
import { flags } from './flags';
import { repoUrl, siteUrl } from './site';

const urlFor = (locale: Locale) => `${siteUrl}${localePrefix(locale)}` || siteUrl;
const ogLocale: Record<Locale, string> = { en: 'en_US', fa: 'fa_IR', ar: 'ar_AR' };

export function buildMetadata(locale: Locale): Metadata {
  const { title, description } = translations[locale].metadata;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    applicationName: 'CodeBridge',
    authors: [{ name: 'Esmaeil Ahmadipour' }],
    appleWebApp: { capable: true, title: 'CodeBridge', statusBarStyle: 'default' },
    robots: { index: true, follow: true },
    alternates: {
      canonical: urlFor(locale),
      languages: { ...Object.fromEntries(locales.map((l) => [l, urlFor(l)])), 'x-default': urlFor(defaultLocale) },
    },
    openGraph: {
      type: 'website', siteName: 'CodeBridge', title, description, url: urlFor(locale), locale: ogLocale[locale],
      images: [{ url: '/og/og.png', width: 1200, height: 630, alt: 'CodeBridge' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og/og.png'] },
  };
}

export function buildJsonLd(locale: Locale) {
  const { description } = translations[locale].metadata;
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CodeBridge',
    description,
    url: urlFor(locale),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: flags.downloads ? 'Windows, macOS, Linux, Android, iOS' : 'Any (web browser)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: 'Esmaeil Ahmadipour' },
    codeRepository: repoUrl,
    inLanguage: locale,
  };
}
