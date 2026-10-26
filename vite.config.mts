/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, Plugin } from 'vite';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));
const outDir = 'build';

// Top-level folders of src/ that are imported by bare name (`utils/...`), matching tsconfig paths
const srcAliases = ['app', 'locales', 'store', 'styles', 'types', 'utils'].map(dir => ({
  find: new RegExp(`^${dir}(?=/|$)`),
  replacement: `${srcDir}/${dir}`,
}));

/**
 * GitHub Pages has no rewrite rules, so unknown paths are served from 404.html.
 * Making it a copy of index.html lets deep links boot the SPA.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    apply: 'build',
    closeBundle() {
      copyFileSync(`${outDir}/index.html`, `${outDir}/404.html`);
    },
  };
}

export default defineConfig({
  // Served as a GitHub Pages project site: https://manh-vv.github.io/docb/
  base: '/docb/',
  plugins: [react(), spaFallback()],
  resolve: {
    alias: srcAliases,
  },
  build: {
    outDir,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    coverage: {
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/Loadable.{js,jsx,ts,tsx}',
        'src/**/messages.ts',
        'src/**/types.ts',
        'src/index.tsx',
      ],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
});
