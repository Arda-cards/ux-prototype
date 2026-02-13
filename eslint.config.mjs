// eslint.config.mjs
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // ── Global ignores ──────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**', 'storybook-static/**', 'coverage/**'],
  },

  // ── Prettier (disable conflicting format rules) ───────────────────
  prettierConfig,

  // ── TypeScript strict rules ─────────────────────────────────────────
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
    },
    rules: {
      // ── Prettier integration ─────────────────────────────────────
      'prettier/prettier': 'error',

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
  },

  // ── Config & middleware files (TS parser, no type-aware rules) ──────
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
  },

  // ── File naming: kebab-case ─────────────────────────────────────────
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
  },
];
