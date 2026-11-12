import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Download } from '@/components/Download';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { Help } from '@/components/Help';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';
import { Privacy } from '@/components/Privacy';
import { Tool } from '@/components/Tool';
import { flags } from '@/lib/flags';
import { isLocale } from '@/i18n/config';
import { translations } from '@/i18n/translations';
import { buildJsonLd, buildMetadata } from '@/lib/seo';

// Re-generate hourly so release publication metadata shown in the Download section stays current.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata(locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = translations[locale];
  return (
    <>
      <a className="skip" href="#main">{t.nav.skip}</a>
      <Navbar />
      <main id="main">
        <Hero t={t.hero} downloads={flags.downloads} />
        <Tool t={t.tool} />
        <Privacy t={t.privacy} />
        <Features t={t.features} downloads={flags.downloads} />
        {flags.downloads && <Download t={t.download} locale={locale} />}
        <Help t={t.help} locale={locale} />
      </main>
      <Footer t={t.footer} nav={t.nav} locale={locale} home />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(locale)) }} />
    </>
  );
}
