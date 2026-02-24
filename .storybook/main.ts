// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: [
    '../src/docs/**/*.mdx',
    '../src/docs/**/*.stories.@(ts|tsx)',
    '../src/components/**/*.mdx',
    '../src/components/**/*.stories.@(ts|tsx)',
    '../src/visual-elements/**/*.stories.@(ts|tsx|mdx)',
    '../src/applications/**/*.stories.@(ts|tsx)',
    '../src/use-cases/**/*.mdx',
    '../src/use-cases/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', 'msw-storybook-addon'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { resolve } = await import('node:path');

    config.resolve = config.resolve || {};
    // Use array format for aliases to guarantee matching order.
    // More specific aliases (e.g., @frontend/lib/jwt) MUST come before
    // less specific ones (e.g., @frontend) so they match first.
    const existingAlias = config.resolve.alias || {};
    const existingAliasArray = Array.isArray(existingAlias)
      ? existingAlias
      : Object.entries(existingAlias).map(([find, replacement]) => ({ find, replacement }));

    config.resolve.alias = [
      ...existingAliasArray,
      // Specific shims for blocklisted/server-only modules (must come BEFORE @frontend)
      { find: '@frontend/lib/jwt', replacement: resolve(__dirname, '../src/shims/frontend-jwt.ts') },
      { find: '@aws-sdk/client-cognito-identity-provider', replacement: resolve(__dirname, '../src/shims/aws-cognito-stub.ts') },
      // General aliases
      { find: '@', replacement: resolve(__dirname, '../src') },
      { find: '@frontend', replacement: resolve(__dirname, '../src/vendored/arda-frontend') },
      // Next.js shims
      { find: 'next/navigation', replacement: resolve(__dirname, '../src/shims/next-navigation.tsx') },
      { find: 'next/image', replacement: resolve(__dirname, '../src/shims/next-image.tsx') },
      { find: 'next/link', replacement: resolve(__dirname, '../src/shims/next-link.tsx') },
      { find: 'next/dynamic', replacement: resolve(__dirname, '../src/shims/next-dynamic.tsx') },
    ];

    config.css = config.css || {};
    config.css.postcss = {
      plugins: [(await import('@tailwindcss/postcss')).default],
    };

    config.build = config.build || {};
    config.build.chunkSizeWarningLimit = 1200;
    config.build.rollupOptions = config.build.rollupOptions || {};
    const existingOnwarn = config.build.rollupOptions.onwarn;
    config.build.rollupOptions.onwarn = (warning, defaultHandler) => {
      if (warning.code === 'EVAL' && warning.id?.includes('node_modules')) {
        return;
      }
      if (existingOnwarn) {
        existingOnwarn(warning, defaultHandler);
      } else {
        defaultHandler(warning);
      }
    };

    return config;
  },
};

export default config;
