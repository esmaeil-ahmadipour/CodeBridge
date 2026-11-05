import type { Viewport } from 'next';
import { notFound } from 'next/navigation';
import '../globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { themeInitialization } from '@/lib/theme-init';
import { RegisterSW } from '@/components/RegisterSW';
import { isLocale, isRtlLocale, locales } from '@/i18n/config';
import { fontVariables } from '@/lib/fonts';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F7F9' },
    { media: '(prefers-color-scheme: dark)', color: '#0E1116' },
  ],
};

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const rtl = isRtlLocale(locale);
  return (
    <html lang={locale} dir={rtl ? 'rtl' : 'ltr'} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitialization }} />
        {rtl && <link rel="preload" href="/fonts/vazirmatn-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />}
      </head>
      <body className={rtl ? 'rtl' : undefined}>
        <ThemeProvider>
          <LanguageProvider locale={locale}>
            {children}
            <RegisterSW />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
