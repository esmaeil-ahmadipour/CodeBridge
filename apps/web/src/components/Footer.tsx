import Link from 'next/link';
import { localePrefix, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/translations';
import { flags } from '@/lib/flags';
import { Logo } from './Icons';

export function Footer({ t, nav, locale, home }: { t: Dictionary['footer']; nav: Dictionary['nav']; locale: Locale; home: boolean }) {
  // Plain #anchors on the landing page; links back to it from other pages.
  const base = home ? '' : `${localePrefix(locale)}/`;
  return (
    <footer className="wrap foot">
      <div className="foot-top">
        <div className="stack8">
          <a className="brand" href={home ? '#top' : localePrefix(locale) || '/'}><Logo size={24} /> CodeBridge</a>
          <p className="mut sm foot-tag">{t.tagline}</p>
        </div>
        <nav className="foot-links" aria-label="Footer">
          <a href={`${base}#try`}>{nav.tryIt}</a>
          <a href={`${base}#privacy`}>{nav.privacy}</a>
          {flags.downloads && <a href={`${base}#download`}>{nav.download}</a>}
          <Link href={`${localePrefix(locale)}/guide`}>{nav.guide}</Link>
        </nav>
      </div>
      <p className="mut sm foot-bot">{t.license}</p>
    </footer>
  );
}
