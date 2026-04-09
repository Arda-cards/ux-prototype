import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // heic2any eagerly instantiates a Web Worker on import, which is
      // unavailable in jsdom.  Point the module at a lightweight stub so
      // every test that transitively imports it can load without error.
      heic2any: resolve(__dirname, './src/__mocks__/heic2any.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', '.storybook/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['src/vendored/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      include: ['src/components/**/*.{ts,tsx}'],
      exclude: ['**/*.stories.{ts,tsx}', '**/*.test.{ts,tsx}', '**/index.ts'],
      thresholds: {
        statements: 85,
        branches: 75,
        functions: 65,
        lines: 85,
      },
    },
  },
});
