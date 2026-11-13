import Link from 'next/link';
import { localePrefix, type Locale } from '@/i18n/config';
import { translations, type Dictionary } from '@/i18n/translations';
import { fmt } from '@/lib/fmt';
import { formatReleaseDate, getLatestRelease } from '@/lib/release';
import { getApplicationVersion, latestReleaseUrl } from '@/lib/site';

export async function Footer({ t, nav, locale, dir }: { t: Dictionary['footer']; nav: Dictionary['nav']; locale: Locale; dir: 'ltr' | 'rtl' }) {
  const d = translations[locale].download;
  const release = await getLatestRelease(); // never throws; null on any failure
  const date = formatReleaseDate(release?.publishedAt ?? null, locale);
  const home = localePrefix(locale) || '/';
  const license = t.license.split(' · ')[0]; // "MIT licensed" / "مجوز MIT" / "رخصة MIT"
  return (
    <footer className="ref-footer" dir={dir}>
      <div className="ref-wrap ft">
        <div className="ft-main">
          <div className="ft-brand">
            <Link href={home} className="ref-brand">CodeBridge<span>.</span></Link>
            <p className="mut">{t.tagline}</p>
          </div>
          <nav className="ft-links" aria-label="Footer">
            <Link href={`${localePrefix(locale)}/guide`}>{nav.guide}</Link>
            <a href={latestReleaseUrl} target="_blank" rel="noopener">{d.releaseChecksums}</a>
          </nav>
        </div>
        <div className="ft-bar">
          <div className="ft-meta">
            <span className="ref-badge" dir="ltr">v{getApplicationVersion()}</span>
            {date && <span>{fmt(d.relPublished, { date })}</span>}
          </div>
          <div className="ft-meta">
            <span>{t.developer}: <a href="https://esmaeil.tarvix.org" target="_blank" rel="noopener">{t.developerName}</a></span>
            <span>{license}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}