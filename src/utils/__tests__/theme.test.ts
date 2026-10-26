import { act, renderHook } from '@testing-library/react';
import { DEFAULT_THEME, themes } from 'styles/themes';

import { readTheme, THEME_KEY, useTheme } from '../theme';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to the default theme and ignores unknown stored values', () => {
    expect(readTheme()).toBe(DEFAULT_THEME);
    localStorage.setItem(THEME_KEY, 'no-such-theme');
    expect(readTheme()).toBe(DEFAULT_THEME);
  });

  it('applies and remembers the chosen theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe(DEFAULT_THEME);

    act(() => result.current[1]('sepia'));

    expect(document.documentElement.getAttribute('data-theme')).toBe('sepia');
    expect(localStorage.getItem(THEME_KEY)).toBe('sepia');
    expect(readTheme()).toBe('sepia');
  });

  it('defines every color token for light and dark in every theme', () => {
    const names = Object.keys(themes[0].light).sort();
    for (const theme of themes) {
      expect(Object.keys(theme.light).sort()).toEqual(names);
      expect(Object.keys(theme.dark).sort()).toEqual(names);
    }
  });
});
