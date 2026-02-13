import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/docs/**/*.mdx',
    '../src/components/**/*.mdx',
    '../src/components/**/*.stories.@(ts|tsx)',
    '../src/visual-elements/**/*.stories.@(ts|tsx|mdx)',
    '../src/applications/**/*.stories.@(ts|tsx)',
    '../src/use-cases/**/*.mdx',
    '../src/use-cases/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
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

    return config;
  },
};

export default config;
