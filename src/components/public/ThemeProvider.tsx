'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'newsight_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Synchronize DOM classes, attribute, and colorScheme
  const applyThemeToDOM = useCallback((newTheme: Theme, animate = false) => {
    const root = document.documentElement;

    if (animate) {
      root.classList.add('theme-transition');
    }

    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    root.setAttribute('data-theme', newTheme);
    root.style.colorScheme = newTheme;

    if (animate) {
      window.setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 250);
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    setIsMounted(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored);
        applyThemeToDOM(stored, false);
      } else {
        setThemeState('light');
        applyThemeToDOM('light', false);
      }
    } catch (_) {
      // Fallback if localStorage is inaccessible
      applyThemeToDOM('light', false);
    }

    // Listen to OS scheme changes ONLY if user has no explicit preference stored
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleOSChange = (e: MediaQueryListEvent) => {
      const hasExplicitChoice = localStorage.getItem(STORAGE_KEY);
      if (!hasExplicitChoice) {
        const newTheme: Theme = e.matches ? 'light' : 'dark';
        setThemeState(newTheme);
        applyThemeToDOM(newTheme, true);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleOSChange);
    } else {
      mediaQuery.addListener(handleOSChange);
    }

    // Synchronize across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
        applyThemeToDOM(e.newValue, true);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleOSChange);
      } else {
        mediaQuery.removeListener(handleOSChange);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [applyThemeToDOM]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      applyThemeToDOM(newTheme, true);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch (_) {}
    },
    [applyThemeToDOM]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isMounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
