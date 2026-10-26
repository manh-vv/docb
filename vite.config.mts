/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

// Top-level folders of src/ that are imported by bare name (`utils/...`), matching tsconfig paths
const srcAliases = ['app', 'locales', 'store', 'styles', 'types', 'utils'].map(dir => ({
  find: new RegExp(`^${dir}(?=/|$)`),
  replacement: `${srcDir}/${dir}`,
}));

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: srcAliases,
  },
  build: {
    outDir: 'build',
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
