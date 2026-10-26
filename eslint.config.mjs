import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['build/', 'coverage/', 'functions/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  prettierRecommended,
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      // The codebase leans on `any` and `Function` types (as the old react-app config allowed)
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      // Generated containers start from empty `Props` / `State` interfaces
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
    },
  },
  {
    files: ['**/*.ts?(x)'],
    rules: { 'prettier/prettier': 'warn' },
  },
);
