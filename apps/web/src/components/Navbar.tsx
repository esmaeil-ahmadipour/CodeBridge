'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { localePrefix, locales, stripLocale, type Locale } from '@/i18n/config';
import { flags } from '@/lib/flags';
import { Icon, Logo } from './Icons';

const LABEL: Record<Locale, string> = { en: 'EN', fa: 'فا', ar: 'ع' };

export function Navbar() {
  const { t, locale, setLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  // On the landing page the section links are plain #anchors; on other pages they point back to the landing page.
  const onHome = stripLocale(usePathname()) === '/';
  const home = onHome ? '' : `${localePrefix(locale)}/`;
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <a href={onHome ? '#top' : localePrefix(locale) || '/'} className="brand"><Logo /> CodeBridge</a>
        <nav className="links" aria-label="Sections">
          <a href={`${home}#try`}>{t.nav.tryIt}</a>
          <a href={`${home}#privacy`}>{t.nav.privacy}</a>
          {flags.downloads && <a href={`${home}#download`}>{t.nav.download}</a>}
          <Link href={`${localePrefix(locale)}/guide`} aria-current={onHome ? undefined : 'page'}>{t.nav.guide}</Link>
        </nav>
        <div className="tools">
          <div className="seg" role="group" aria-label={t.nav.language}>
            {locales.map((l) => (
              <button key={l} type="button" lang={l} aria-pressed={l === locale} onClick={() => setLocale(l)}>
                {LABEL[l]}
              </button>
            ))}
          </div>
          <button type="button" className="btn sq" onClick={toggleTheme} aria-label={t.nav.theme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
