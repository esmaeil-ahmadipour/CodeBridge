'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { isLocale, localePrefix, locales, stripLocale, type Locale } from '@/i18n/config';
import { flags } from '@/lib/flags';
import { Icon } from './Icons';

const LABEL: Record<Locale, string> = { en: 'EN', fa: 'فا', ar: 'ع' };

export function Navbar() {
  const { t, locale, setLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  // On the landing page the section links are plain #anchors; on other pages they point back to the landing page.
  const onHome = stripLocale(usePathname()) === '/';
  const home = onHome ? '' : `${localePrefix(locale)}/`;
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <header className="ref-header" ref={headerRef}>
      <div className="ref-wrap ref-nav">
        <button
          type="button"
          className="ref-menu-toggle"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={t.guide.toc}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? 'close' : 'menu'} size={20} />
        </button>
        <a href={onHome ? '#top' : localePrefix(locale) || '/'} className="ref-brand">CodeBridge<span>.</span></a>
        {open && (
          <div
            id="site-menu"
            className="ref-menu"
            onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false); }}
          >
            <nav className="ref-links" aria-label="Sections">
              <a href={`${home}#how`}>{t.nav.how}</a>
              <a href={`${home}#mobile`}>{t.nav.mobile}</a>
              <a href={`${home}#features`}>{t.nav.features}</a>
              <a href={`${home}#trust`}>{t.nav.trust}</a>
              <a href={`${home}#web`}>{t.nav.web}</a>
            </nav>
            <div className="ref-menu-actions">
              {flags.downloads && <a className="ref-button ref-button-primary ref-nav-download" href={`${home}#dl`}>{t.nav.download}</a>}
            </div>
          </div>
        )}
        <div className="ref-controls">
          <label className="visually-hidden" htmlFor="site-language">{t.nav.language}</label>
          <select
            id="site-language"
            className="ref-language"
            value={locale}
            onChange={(event) => {
              const nextLocale = event.currentTarget.value;
              if (isLocale(nextLocale)) { setLocale(nextLocale); setOpen(false); }
            }}
          >
            {locales.map((l) => <option key={l} value={l}>{LABEL[l]}</option>)}
          </select>
          <button type="button" className="ref-theme" onClick={toggleTheme} aria-label={t.nav.theme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
