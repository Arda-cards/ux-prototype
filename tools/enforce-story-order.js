#!/usr/bin/env node

/**
 * Enforces sidebar ordering convention for Storybook story files:
 *   1. All named exports EXCEPT Playground (in file order)
 *   2. Playground export last
 *
 * Usage:
 *   node tools/enforce-story-order.js [--check] [glob]
 *
 * --check   Dry-run mode: exits 1 if any file needs reordering (for CI).
 * glob      Optional glob pattern (default: src/components/canary/** /*.stories.tsx)
 *
 * The script reads each .stories.tsx file, finds all `export const` blocks,
 * and moves the Playground export to the end if it isn't already last.
 *
 * Uses only node:fs and node:path — no external dependencies.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const customGlob = args.find((a) => !a.startsWith('--'));

// Simple recursive file finder (no glob dependency needed)
function findFiles(dir, pattern) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      results.push(...findFiles(full, pattern));
    } else if (entry.isFile() && pattern.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const searchDir = customGlob ? resolve(root, customGlob) : resolve(root, 'src/components/canary');
const files = findFiles(searchDir, /\.stories\.tsx$/);

let violations = 0;

for (const file of files) {
  const source = readFileSync(file, 'utf-8');
  const lines = source.split('\n');

  // Find all top-level `export const` blocks with their line ranges.
  // Each block starts at `export const Xxx` and ends before the next
  // `export const` or end of file.
  const exportStarts = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^export const (\w+)/);
    if (match) {
      exportStarts.push({ name: match[1], start: i });
    }
  }

  if (exportStarts.length === 0) continue;

  // Find the Playground export
  const pgIdx = exportStarts.findIndex((e) => e.name === 'Playground');
  if (pgIdx === -1) continue; // No Playground in this file
  if (pgIdx === exportStarts.length - 1) continue; // Already last

  // Playground is not last — needs reordering
  const rel = relative(root, file);
  violations++;

  if (checkOnly) {
    console.log(`FAIL: ${rel} — Playground is export #${pgIdx + 1} of ${exportStarts.length} (should be last)`);
    continue;
  }

  // Extract the Playground block (from its export const to the line before
  // the next export const, including any preceding comments/JSDoc)
  const pgStart = exportStarts[pgIdx].start;
  const pgEnd =
    pgIdx + 1 < exportStarts.length ? exportStarts[pgIdx + 1].start : lines.length;

  // Also capture JSDoc/comment lines immediately above the export
  let commentStart = pgStart;
  while (commentStart > 0 && /^\s*(\/\*\*|\*|\/\/|$)/.test(lines[commentStart - 1])) {
    commentStart--;
  }

  const playgroundBlock = lines.slice(commentStart, pgEnd);
  const before = lines.slice(0, commentStart);
  const after = lines.slice(pgEnd);

  // Reassemble: everything else, then Playground at the end
  const result = [...before, ...after, ...playgroundBlock].join('\n');
  writeFileSync(file, result, 'utf-8');
  console.log(`FIXED: ${rel} — moved Playground to end`);
}

if (checkOnly && violations > 0) {
  console.log(`\n${violations} file(s) have Playground not last. Run without --check to fix.`);
  process.exit(1);
} else if (checkOnly) {
  console.log('All story files have Playground last.');
} else if (violations > 0) {
  console.log(`\n${violations} file(s) fixed.`);
} else {
  console.log('All story files already have Playground last.');
}
