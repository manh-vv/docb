import { createGlobalStyle } from 'styled-components';

/**
 * Design tokens. Components read colors, type and shape from these variables only,
 * so color modes and themes are a matter of redefining them.
 */
export const GlobalStyle = createGlobalStyle`
  :root {
    --db-font-ui: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --db-font-reading: 'Source Serif 4', Georgia, 'Times New Roman', serif;
    --db-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

    --db-bg: #f7f6f3;
    --db-surface: #ffffff;
    --db-surface-muted: #f1efea;
    --db-border: #e6e2da;
    --db-border-strong: #d6d1c6;
    --db-text: #1d1c21;
    --db-text-muted: #6b6a73;
    --db-heading: #121116;
    --db-accent: #4f46e5;
    --db-accent-hover: #4338ca;
    --db-accent-soft: rgb(79 70 229 / 0.1);
    --db-on-accent: #ffffff;
    --db-skeleton: #e8e4dc;
    --db-code-bg: #f2efe9;
    --db-header-bg: rgb(247 246 243 / 0.82);

    --db-radius-lg: 16px;
    --db-radius: 10px;
    --db-radius-sm: 6px;
    --db-shadow-sm: 0 1px 2px rgb(20 20 30 / 0.05), 0 1px 3px rgb(20 20 30 / 0.04);
    --db-shadow-lg: 0 18px 40px -18px rgb(20 20 30 / 0.28);
    --db-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
    --db-header-height: 60px;
    --db-sidebar-width: 288px;
  }

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
