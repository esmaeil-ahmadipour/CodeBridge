import Link from 'next/link';
import { localePrefix, type Locale } from '@/i18n/config';
import { translations, type Dictionary } from '@/i18n/translations';
import { fmt } from '@/lib/fmt';
import { formatReleaseDate, getLatestRelease } from '@/lib/release';
import { getApplicationVersion, latestReleaseUrl } from '@/lib/site';

type FooterProps = {
  t: Dictionary['footer'];
  nav: Dictionary['nav'];
  locale: Locale;
  dir: 'ltr' | 'rtl';
  theme?: 'light' | 'dark';
};

export async function Footer({ t, nav, locale, dir, theme }: FooterProps) {
  const d = translations[locale].download;
  const release = await getLatestRelease(); // never throws; null on any failure
  const date = formatReleaseDate(release?.publishedAt ?? null, locale);
  return (
    <footer className="ref-footer" dir={dir} data-theme={theme}>
      <div className="ref-wrap">
        <div className="ref-footer-layout">
          <Link className="ref-footer-brand" href={localePrefix(locale) || '/'} aria-label="CodeBridge">
            CodeBridge<span>.</span>
          </Link>
          <div className="ref-footer-content">
            <div className="ref-footer-copy">
              <p className="ref-footer-tag">{t.tagline}</p>
              <p className="ref-footer-license">{t.license}</p>
            </div>
            <div className="ref-footer-meta">
              <span className="ref-badge" dir="ltr">v{getApplicationVersion()}</span>
              {date && <span className="ref-footer-date">{fmt(d.relPublished, { date })}</span>}
              <a className="ref-checksum" href={latestReleaseUrl} aria-label={d.releaseChecksums}>
                {d.releaseChecksums}
              </a>
            </div>
            <div className="ref-footer-bottom">
              <p>
                {t.developer}: <a href="https://esmaeil.tarvix.org" target="_blank" rel="noopener">{t.developerName}</a>
              </p>
              <Link href={`${localePrefix(locale)}/guide`}>{nav.guide}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
