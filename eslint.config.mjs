// eslint.config.mjs
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json', // Adjust if needed
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
    },
    rules: {
      // Enforce camelCase for variables and functions
      '@typescript-eslint/naming-convention': [
        'error',
        // Variables and functions
        {
          selector: 'variableLike',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        // Constants (UPPER_SNAKE_CASE)
        {
          selector: 'variable',
          modifiers: ['const'],
//          types: ['boolean', 'string', 'number'],
          format: ['UPPER_CASE', 'camelCase'],
        },
        // Types (type aliases, interfaces)
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // Enums
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        // Booleans should start with "is", "has", "should", "can"
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['camelCase'],
          custom: {
            regex: '^(is|has|should|can)[A-Z]',
            match: true,
          },
        },
      ],

      // Disallow abbreviations (optional)
      'id-length': ['error', { min: 2, exceptions: ['i', 'j', 'k', '_'] }],

      // Prettier integration (optional)
      'prettier/prettier': 'error',
    },
  },

  // Enforce file naming convention: kebab-case
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'unicorn': (await import('eslint-plugin-unicorn')).default,
    },
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
          },
        },
      ],
    },
  },
];
