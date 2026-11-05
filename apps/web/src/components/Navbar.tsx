'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { locales, type Locale } from '@/i18n/config';
import { flags } from '@/lib/flags';
import { Icon, Logo } from './Icons';

const LABEL: Record<Locale, string> = { en: 'EN', fa: 'فا', ar: 'ع' };

export function Navbar() {
  const { t, locale, setLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <a href="#top" className="brand"><Logo /> CodeBridge</a>
        <nav className="links" aria-label="Sections">
          <a href="#try">{t.nav.tryIt}</a>
          <a href="#privacy">{t.nav.privacy}</a>
          {flags.downloads && <a href="#download">{t.nav.download}</a>}
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
