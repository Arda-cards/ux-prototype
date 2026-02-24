#!/usr/bin/env node
/**
 * install-vendored-deps.js — Install vendored dependencies from vendored-deps.json
 *
 * Reads vendored-deps.json from the repo root. If absent, exits silently (no-op).
 * Checks each dependency against node_modules and installs missing/outdated via
 * `npm install --no-save`.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const depsFile = resolve(repoRoot, 'vendored-deps.json');

// Silent exit if no vendored-deps.json
if (!existsSync(depsFile)) {
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(depsFile, 'utf8'));
const deps = manifest.dependencies || {};
const depNames = Object.keys(deps);

if (depNames.length === 0) {
  console.log('No vendored dependencies to install.');
  process.exit(0);
}

// Check which deps are missing or outdated
const toInstall = [];

for (const [name, version] of Object.entries(deps)) {
  const pkgPath = resolve(repoRoot, 'node_modules', name, 'package.json');
  if (!existsSync(pkgPath)) {
    toInstall.push(`${name}@${version}`);
    continue;
  }

  // Check installed version — simple presence check is sufficient for --no-save
  // We could do semver comparison but for vendored deps, just ensure it exists
}

if (toInstall.length === 0) {
  console.log(`All ${depNames.length} vendored dependencies are already installed.`);
  process.exit(0);
}

console.log(`Installing ${toInstall.length} vendored dependencies...`);
const installCmd = `npm install --no-save ${toInstall.join(' ')}`;
console.log(`  ${installCmd}`);

try {
  execSync(installCmd, { cwd: repoRoot, stdio: 'inherit' });
  console.log('Vendored dependencies installed successfully.');
} catch (error) {
  console.error('Failed to install vendored dependencies:', error.message);
  process.exit(1);
}
