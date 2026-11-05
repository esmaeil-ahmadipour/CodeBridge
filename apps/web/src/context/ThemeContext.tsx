'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// useLayoutEffect on the client (runs before paint, so no flash), noop-safe on the server.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Same resolution order as the inline script in lib/theme-init.ts.
const resolveTheme = (): Theme => {
  const current = document.documentElement.dataset.theme;
  if (current === 'light' || current === 'dark') return current;
  try {
    const stored = localStorage.getItem('codebridge-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage may be unavailable; fall back to the system preference.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  // The inline theme script only runs on the initial document load. Switching language
  // re-renders the root layout (<html> is recreated, so data-theme is lost) and this
  // provider remounts; re-apply the theme before paint instead of falling back to light.
  useIsomorphicLayoutEffect(() => {
    const resolved = resolveTheme();
    document.documentElement.dataset.theme = resolved;
    setThemeState(resolved);
  }, []);

  const applyTheme = (targetTheme: Theme) => {
    document.documentElement.dataset.theme = targetTheme;
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem('codebridge-theme', newTheme);
    } catch (error) {
      console.error('Unable to persist the selected theme.', error);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
