'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { themes, type ThemeConfig } from '@/lib/themes';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  activeTheme: ThemeConfig;
  mode: ThemeMode;
  setActiveTheme: (themeId: string) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: themes.default,
  mode: 'auto',
  setActiveTheme: () => {},
  setMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const THEME_CLASSES = [
  'theme-default',
  'theme-christmas',
  'theme-easter',
  'theme-back-to-school',
  'theme-black-friday',
];

function applyThemeToDOM(themeId: string, mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Apply theme class
  THEME_CLASSES.forEach(cls => root.classList.remove(cls));
  if (themeId !== 'default') {
    root.classList.add(`theme-${themeId}`);
  }

  // Apply dark mode
  root.classList.remove('dark', 'light');
  if (mode === 'dark') {
    root.classList.add('dark');
  } else if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) root.classList.add('dark');
  }
  // mode === 'light' = no class needed
}

function getInitialTheme(serversideTheme: string): ThemeConfig {
  // Check localStorage first for immediate client-side switch
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('shoe-store-theme');
    if (saved && themes[saved]) return themes[saved];
  }
  // Fall back to server-injected theme
  if (themes[serversideTheme]) return themes[serversideTheme];
  return themes.default;
}

function getInitialMode(serversideMode: string): ThemeMode {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('shoe-store-mode') as ThemeMode | null;
    if (saved && ['light', 'dark', 'auto'].includes(saved)) return saved;
  }
  if (['light', 'dark', 'auto'].includes(serversideMode)) return serversideMode as ThemeMode;
  return 'auto';
}

export function ThemeProvider({
  children,
  initialTheme = 'default',
  initialMode = 'auto',
}: {
  children: ReactNode;
  initialTheme?: string;
  initialMode?: string;
}) {
  const [activeTheme, setActiveThemeState] = useState<ThemeConfig>(() => getInitialTheme(initialTheme));
  const [mode, setModeState] = useState<ThemeMode>(() => getInitialMode(initialMode));

  // Apply theme + dark mode to DOM whenever they change
  useEffect(() => {
    applyThemeToDOM(activeTheme.id, mode);
  }, [activeTheme, mode]);

  // Listen for OS dark mode changes when in auto mode
  useEffect(() => {
    if (mode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemeToDOM(activeTheme.id, 'auto');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, activeTheme.id]);

  const setActiveTheme = useCallback((themeId: string) => {
    const theme = themes[themeId] || themes.default;
    setActiveThemeState(theme);
    localStorage.setItem('shoe-store-theme', themeId);
    // Persist to DB in background (non-blocking)
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'theme', value: themeId }),
    }).catch(() => {});
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('shoe-store-mode', newMode);
    // Persist to DB in background
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'theme-mode', value: newMode }),
    }).catch(() => {});
  }, []);

  return (
    <ThemeContext.Provider value={{ activeTheme, mode, setActiveTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
