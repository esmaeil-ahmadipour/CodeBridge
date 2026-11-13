import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Guide } from '@/components/Guide';
import { Navbar } from '@/components/Navbar';
import { isLocale, locales } from '@/i18n/config';
import { translations } from '@/i18n/translations';
import { buildGuideMetadata } from '@/lib/seo';

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildGuideMetadata(locale);
}

export default async function GuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = translations[locale];
  return (
    <>
      <a className="skip" href="#main">{t.nav.skip}</a>
      <Navbar />
      <main id="main">
        <Guide t={t.guide} locale={locale} />
      </main>
      <Footer t={t.footer} nav={t.nav} locale={locale} dir={locale === 'en' ? 'ltr' : 'rtl'} />
    </>
  );
}
