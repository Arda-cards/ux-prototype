// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
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
  addons: ['@storybook/addon-docs', './addons/agentation-toggle/manager'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { resolve } = await import('node:path');

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, '../src'),
    };

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
