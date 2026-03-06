import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

const isLibBuild = !!process.env.LIB_BUILD;

export default defineConfig({
  plugins: [
    react(),
    ...(isLibBuild
      ? [
          dts({
            tsconfigPath: './tsconfig.build.json',
            rollupTypes: true,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        canary: resolve(__dirname, 'src/canary.ts'),
        extras: resolve(__dirname, 'src/extras.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'ag-grid-community',
        'ag-grid-react',
        'lucide-react',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
});
