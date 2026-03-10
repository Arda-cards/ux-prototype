#!/usr/bin/env node

/**
 * Post-build script: copies styles and assets into dist/ for the npm package.
 *
 * Run automatically after `vite build` via the build:lib script.
 * Uses only node:fs — no external dependencies.
 */

import { cpSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

/** @type {Array<{ src: string; dest: string }>} */
const targets = [
  // Nominal styles
  { src: 'src/styles/globals.css', dest: 'dist/styles/globals.css' },
  { src: 'src/styles/ag-theme-arda.css', dest: 'dist/styles/ag-theme-arda.css' },
  { src: 'src/styles/tokens.css', dest: 'dist/styles/tokens.css' },
  // Canary styles
  { src: 'src/styles/canary', dest: 'dist/styles/canary' },
  // Nominal images
  { src: 'public/images', dest: 'dist/assets/images' },
  // Canary images
  { src: 'public/canary/images', dest: 'dist/assets/canary/images' },
];

for (const { src, dest } of targets) {
  const srcPath = resolve(root, src);
  const destPath = resolve(root, dest);
  mkdirSync(dirname(destPath), { recursive: true });
  cpSync(srcPath, destPath, { recursive: true });
  console.log(`  copied ${src} → ${dest}`);
}

console.log('✓ styles and assets copied to dist/');
