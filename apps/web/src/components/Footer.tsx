import Link from 'next/link';
import { localePrefix, type Locale } from '@/i18n/config';
import { translations, type Dictionary } from '@/i18n/translations';
import { fmt } from '@/lib/fmt';
import { formatReleaseDate, getLatestRelease } from '@/lib/release';
import { getApplicationVersion, latestReleaseUrl } from '@/lib/site';

export async function Footer({ t, nav, locale }: { t: Dictionary['footer']; nav: Dictionary['nav']; locale: Locale }) {
  const d = translations[locale].download;
  const release = await getLatestRelease(); // never throws; null on any failure
  const date = formatReleaseDate(release?.publishedAt ?? null, locale);
  return (
    <footer className="ref-footer">
      <div className="ref-wrap">
        <div className="ref-footer-top">
          <p className="ref-footer-tag">{t.tagline}</p>
          <div className="ref-footer-meta">
            <span className="ref-badge" dir="ltr">v{getApplicationVersion()}</span>
            {date && <span className="ref-footer-date">{fmt(d.relPublished, { date })}</span>}
            <a className="ref-checksum" href={latestReleaseUrl} aria-label={d.releaseChecksums}>Checksum</a>
          </div>
        </div>
        <div className="ref-footer-bottom">
          <p>
            {t.developer}: <a href="https://esmaeil.tarvix.org" target="_blank" rel="noopener">{t.developerName}</a>
          </p>
          <Link href={`${localePrefix(locale)}/guide`}>{nav.guide}</Link>
        </div>
      </div>
    </footer>
  );
}
