'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { translations, type Dictionary as TranslationDictionary } from '@/i18n/translations';
import { isRtlLocale, localizePath } from '@/i18n/config';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRtl: boolean;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * The route is the single source of truth for the locale. <html lang dir> and the
 * body `rtl` class are rendered on the server by app/[locale]/layout.tsx, so there is
 * no client-side state/DOM patching here. Switching language is a soft navigation.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode; locale: Locale }> = ({
  children,
  locale,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      try {
        localStorage.setItem('codebridge-locale', next);
      } catch {
        // Persisting the preference is best-effort.
      }
      // Keep the hash and scroll position; no `?lang=` query (it created duplicate URLs).
      router.push(`${localizePath(pathname, next)}${window.location.hash}`, { scroll: false });
    },
    [locale, pathname, router],
  );

  const value = useMemo(
    () => ({ locale, setLocale, isRtl: isRtlLocale(locale), t: translations[locale] }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
