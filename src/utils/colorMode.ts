import { useCallback, useEffect, useState } from 'react';

export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedColorMode = Exclude<ColorMode, 'system'>;

/** Also read by the inline script in index.html that applies the mode before first paint */
export const COLOR_MODE_KEY = 'docb:color-mode';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function readColorMode(): ColorMode {
  try {
    const stored = window.localStorage.getItem(COLOR_MODE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // storage can be unavailable, e.g. blocked site data
  }
  return 'system';
}

export function resolveColorMode(mode: ColorMode, prefersDark: boolean): ResolvedColorMode {
  if (mode === 'system') {
    return prefersDark ? 'dark' : 'light';
  }
  return mode;
}

/** Bootstrap and the `--db-*` tokens both key off `data-bs-theme` on the root element */
export function applyColorMode(resolved: ResolvedColorMode) {
  document.documentElement.setAttribute('data-bs-theme', resolved);
  syncThemeColorMeta();
}

/** Match the browser UI color to the page background of the current mode and theme */
export function syncThemeColorMeta() {
  const background = getComputedStyle(document.documentElement).getPropertyValue('--db-bg').trim();
  if (background) {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
  }
}

export function useColorMode() {
  const [mode, setModeState] = useState<ColorMode>(readColorMode);

  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY);
    const update = () => applyColorMode(resolveColorMode(mode, !!media?.matches));
    update();

    if (mode !== 'system' || !media) {
      return;
    }
    // follow the OS while the preference is "system"
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [mode]);

  const setMode = useCallback((next: ColorMode) => {
    try {
      window.localStorage.setItem(COLOR_MODE_KEY, next);
    } catch {
      // the choice then only lasts for this page view
    }
    setModeState(next);
  }, []);

  return [mode, setMode] as const;
}
