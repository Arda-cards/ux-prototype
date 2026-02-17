// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

// eslint.config.mjs
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import noHardcodedColors from './tools/eslint-rules/no-hardcoded-colors.js';

export default [// ── Global ignores ──────────────────────────────────────────────────
{
  ignores: ['dist/**', 'node_modules/**', 'public/**', 'storybook-static/**', 'coverage/**'],
}, // ── Prettier (disable conflicting format rules) ───────────────────
prettierConfig, // ── TypeScript strict rules ─────────────────────────────────────────
{
  files: ['**/*.ts', '**/*.tsx'],
  ignores: ['.storybook/**', 'middleware.ts'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: './tsconfig.json',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
    prettier,
    'arda-custom': { rules: { 'no-hardcoded-colors': noHardcodedColors } },
  },
  rules: {
    // ── Prettier integration ─────────────────────────────────────
    'prettier/prettier': 'error',

    // ── Design token enforcement (D5: Option A) ─────────────────
    'arda-custom/no-hardcoded-colors': 'warn',

    // ── Unused code (mirrors tsc strict checks) ──────────────────
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-unused-expressions': 'error',

    // ── Type safety ───────────────────────────────────────────────
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-as-const': 'error',

    // ── Import hygiene ────────────────────────────────────────────
    'no-duplicate-imports': 'error',

    // ── General code quality ──────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    eqeqeq: ['error', 'always'],
  },
}, // ── Config & middleware files (TS parser, no type-aware rules) ──────
{
  files: ['.storybook/**/*.ts', 'middleware.ts'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
  plugins: {
    prettier,
  },
  rules: {
    'prettier/prettier': 'error',
  },
}, // ── Story files: relax rules for demo callbacks ────────────────────
{
  files: ['**/*.stories.ts', '**/*.stories.tsx'],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
}, // ── Test files: relax rules for test assertions ───────────────────
{
  files: ['**/*.test.ts', '**/*.test.tsx'],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
}, // ── AG Grid integration: any is unavoidable in AG Grid APIs ────────
{
  files: [
    'src/components/molecules/data-grid/**/*.ts',
    'src/components/molecules/data-grid/**/*.tsx',
    'src/components/organisms/shared/entity-data-grid/**/*.ts',
    'src/components/organisms/shared/entity-data-grid/**/*.tsx',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
}, // ── File naming: kebab-case ─────────────────────────────────────────
{
  files: ['**/*.ts', '**/*.tsx'],
  plugins: {
    unicorn,
  },
  rules: {
    'unicorn/filename-case': [
      'error',
      {
        cases: { kebabCase: true },
      },
    ],
  },
}, ...storybook.configs["flat/recommended"]];
