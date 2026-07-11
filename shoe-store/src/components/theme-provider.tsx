'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { themes, type ThemeConfig } from '@/lib/themes';

interface ThemeContextType {
  activeTheme: ThemeConfig;
  setActiveTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: themes.default,
  setActiveTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyThemeClass(themeId: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove(
    'theme-default',
    'theme-christmas',
    'theme-easter',
    'theme-back-to-school',
    'theme-black-friday'
  );
  if (themeId !== 'default') {
    root.classList.add(`theme-${themeId}`);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveThemeState] = useState<ThemeConfig>(themes.default);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Try DB first (server-set), fall back to localStorage
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        const id = data.theme || 'default';
        if (themes[id]) {
          setActiveThemeState(themes[id]);
        }
      })
      .catch(() => {
        // Fallback to localStorage
        const saved = localStorage.getItem('shoe-store-theme');
        if (saved && themes[saved]) {
          setActiveThemeState(themes[saved]);
        }
      });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeClass(activeTheme.id);
  }, [activeTheme, mounted]);

  const setActiveTheme = (themeId: string) => {
    const theme = themes[themeId] || themes.default;
    setActiveThemeState(theme);
    localStorage.setItem('shoe-store-theme', themeId);
    applyThemeClass(themeId);
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
