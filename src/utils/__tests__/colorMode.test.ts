import { act, renderHook } from '@testing-library/react';

import { COLOR_MODE_KEY, readColorMode, resolveColorMode, useColorMode } from '../colorMode';

function mockSystemDark(dark: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: dark,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  window.matchMedia = vi.fn(() => media) as any;
  return {
    change(next: boolean) {
      media.matches = next;
      listeners.forEach(fn => fn());
    },
  };
}

const theme = () => document.documentElement.getAttribute('data-bs-theme');

describe('color mode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-bs-theme');
  });

  it('defaults to system and ignores unknown stored values', () => {
    expect(readColorMode()).toBe('system');
    localStorage.setItem(COLOR_MODE_KEY, 'sepia');
    expect(readColorMode()).toBe('system');
  });

  it('resolves system from the OS preference', () => {
    expect(resolveColorMode('system', true)).toBe('dark');
    expect(resolveColorMode('system', false)).toBe('light');
    expect(resolveColorMode('light', true)).toBe('light');
  });

  it('follows the OS live while on system', () => {
    const system = mockSystemDark(false);
    renderHook(() => useColorMode());
    expect(theme()).toBe('light');

    act(() => system.change(true));
    expect(theme()).toBe('dark');
  });

  it('stores an explicit choice and stops following the OS', () => {
    const system = mockSystemDark(false);
    const { result } = renderHook(() => useColorMode());

    act(() => result.current[1]('dark'));
    expect(theme()).toBe('dark');
    expect(localStorage.getItem(COLOR_MODE_KEY)).toBe('dark');

    act(() => system.change(false));
    expect(theme()).toBe('dark');
  });
});
