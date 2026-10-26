import { createGlobalStyle } from 'styled-components';

import { DEFAULT_THEME, themes, tokensToCss } from './themes';

const defaultTheme = themes.find(theme => theme.id === DEFAULT_THEME)!;

/**
 * Design tokens. Components read colors, type and shape from these variables only,
 * so color modes and themes are a matter of redefining them. Color values come from
 * ./themes: the default theme on :root, the others on data-theme for each color mode.
 */
export const GlobalStyle = createGlobalStyle`
  :root {
    --db-font-ui: 'Geist', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --db-font-reading: var(--db-font-ui);
    --db-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    /* Large headings stay light, which gives the thin, sharp look */
    --db-weight-display: 300;

    ${tokensToCss(defaultTheme.light)}

    --db-radius-lg: 16px;
    --db-radius: 10px;
    --db-radius-sm: 6px;
    --db-shadow-sm: 0 1px 2px rgb(20 20 30 / 0.05), 0 1px 3px rgb(20 20 30 / 0.04);
    --db-shadow-lg: 0 18px 40px -18px rgb(20 20 30 / 0.28);
    --db-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
    --db-header-height: 60px;
    --db-sidebar-width: 288px;
  }

  :root[data-bs-theme='dark'] {
    ${tokensToCss(defaultTheme.dark)}
    --db-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
    --db-shadow-lg: 0 18px 40px -18px rgb(0 0 0 / 0.75);

    color-scheme: dark;
  }

  ${themes
    .filter(theme => theme.id !== DEFAULT_THEME)
    .map(
      theme => `
        :root[data-theme='${theme.id}'][data-bs-theme='light'] { ${tokensToCss(theme.light)} }
        :root[data-theme='${theme.id}'][data-bs-theme='dark'] { ${tokensToCss(theme.dark)} }
      `,
    )
    .join('')}

  html,
  body {
    height: 100%;
    width: 100%;
  }

  html body {
    background: var(--db-bg);
    color: var(--db-text);
    font-family: var(--db-font-ui);
    font-size: 15px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  #root {
    min-height: 100%;
    min-width: 100%;
  }

  a {
    color: var(--db-accent);
  }

  ::selection {
    background: var(--db-accent-soft);
  }

  :focus-visible {
    outline: 2px solid var(--db-accent);
    outline-offset: 2px;
  }

  /* Loading placeholders (see app/components/Loading) */
  .placeholder {
    background-color: var(--db-skeleton);
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
