import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME, themes } from 'styles/themes';

import { syncThemeColorMeta } from './colorMode';

/** Also read by the inline script in index.html that applies the theme before first paint */
export const THEME_KEY = 'docb:theme';

export function readTheme(): string {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored && themes.some(theme => theme.id === stored)) {
      return stored;
    }
  } catch {
    // storage can be unavailable, e.g. blocked site data
  }
  return DEFAULT_THEME;
}

export function applyTheme(id: string) {
  document.documentElement.setAttribute('data-theme', id);
  syncThemeColorMeta();
}

export function useTheme() {
  const [theme, setThemeState] = useState<string>(readTheme);

  useEffect(() => applyTheme(theme), [theme]);

  const setTheme = useCallback((next: string) => {
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // the choice then only lasts for this page view
    }
    setThemeState(next);
  }, []);

  return [theme, setTheme] as const;
}
