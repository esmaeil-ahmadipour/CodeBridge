import Link from 'next/link';
import { localePrefix, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/translations';

export function Footer({ t, nav, locale }: { t: Dictionary['footer']; nav: Dictionary['nav']; locale: Locale }) {
  return (
    <footer className="ref-footer">
      <div className="ref-wrap ref-footer-content">
        <p>{t.tagline}</p>
        <Link href={`${localePrefix(locale)}/guide`}>{nav.guide}</Link>
      </div>
    </footer>
  );
}
