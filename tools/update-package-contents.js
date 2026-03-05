#!/usr/bin/env node

/**
 * Regenerates the "Current Content" section in the Using the Design System
 * docs page based on the actual entry points, styles, and assets on disk.
 *
 * Usage:
 *   node tools/update-package-contents.js
 *
 * The script reads src/index.ts, src/canary.ts, and src/extras.ts to discover
 * exported symbols grouped by section comments (// --- Section Name ---).
 * It also reads copy-dist-assets.js targets and counts files in asset dirs.
 *
 * The generated MDX replaces everything between the AUTO-GENERATED:START and
 * AUTO-GENERATED:END markers in the target file.
 *
 * Uses only node:fs and node:path — no external dependencies.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const MDX_PATH = resolve(root, 'src/docs/workflows/using-the-design-system.mdx');
const START_MARKER = '{/* AUTO-GENERATED:START';
const END_MARKER = '{/* AUTO-GENERATED:END */}';

// ---------------------------------------------------------------------------
// 1. Parse entry point files
// ---------------------------------------------------------------------------

/**
 * Parse a barrel file (index.ts, canary.ts, extras.ts) and return an ordered
 * Map of { section → names[] } where `names` are the exported value identifiers
 * (not types — types are useful for devs but cluttery in a summary table).
 *
 * Grouping strategy:
 *   - Files with `// --- Section Name ---` comments use those as group labels.
 *   - Files without section comments (index.ts, canary.ts) infer groups from
 *     the `from './components/.../atoms/...'` import path.
 *
 * Multi-line exports like `export {\n  Foo,\n  Bar,\n} from '...'` are joined
 * before parsing.
 */
function parseEntryPoint(filePath) {
  const source = readFileSync(filePath, 'utf-8');

  // Join multi-line export statements into single lines.
  // Matches `export {` through the closing `}` (possibly spanning lines).
  const collapsed = source.replace(/export\s*\{([^}]*)\}/gs, (match) => {
    return match.replace(/\n\s*/g, ' ');
  });

  const lines = collapsed.split('\n');
  const hasSectionComments = /^\/\/\s*---\s*.+\s*---/m.test(source);

  /** @type {Map<string, string[]>} section → names */
  const sections = new Map();
  let currentSection = 'Components';

  for (const line of lines) {
    // Detect section headers: // --- Atoms ---  or  // --- Types — Model ---
    const sectionMatch = line.match(/^\/\/\s*---\s*(.+?)\s*---/);
    if (sectionMatch) {
      currentSection = sectionMatch[1]
        .replace(/Extras Placeholders/, 'Placeholders');
      continue;
    }

    // Skip pure type exports
    if (/^\s*export\s+type\s/.test(line)) continue;

    // Match value exports: export { A, B, type C } from './path'
    const exportMatch = line.match(/^export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/);
    if (!exportMatch) continue;

    const braceContent = exportMatch[1];
    const fromPath = exportMatch[2];

    // Infer section from path when no section comments exist
    let section = currentSection;
    if (!hasSectionComments) {
      section = inferSectionFromPath(fromPath);
    }

    const items = braceContent.split(',').map((s) => s.trim());
    for (const item of items) {
      if (!item || item.startsWith('type ')) continue;
      const name = item.includes(' as ') ? item.split(' as ')[0].trim() : item;
      if (!name) continue;
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section).push(name);
    }
  }

  return sections;
}

/** Infer a human-readable section name from a relative import path. */
function inferSectionFromPath(fromPath) {
  if (/\/atoms\//.test(fromPath)) return 'Atoms';
  if (/\/molecules\//.test(fromPath)) return 'Molecules';
  if (/\/organisms\//.test(fromPath)) return 'Organisms';
  if (/\/types\//.test(fromPath)) return 'Types';
  if (/\/lib\//.test(fromPath)) return 'Utilities';
  return 'Components';
}

/**
 * Determine the short label for an entry point by reading its first comment line.
 * e.g. "// Nominal exports — production-ready components." → "Nominal (stable)"
 */
function entryPointLabel(filePath) {
  const first = readFileSync(filePath, 'utf-8').split('\n')[0] || '';
  if (/nominal/i.test(first)) return 'Nominal (stable)';
  if (/canary/i.test(first)) return 'In-development';
  if (/extras/i.test(first)) return 'Supplementary';
  return '';
}

// ---------------------------------------------------------------------------
// 2. Discover styles
// ---------------------------------------------------------------------------

/**
 * Styles are defined by the copy-dist-assets.js targets array.
 * Rather than parsing that file, we enumerate what package.json exports
 * promise: styles shipped under dist/styles/.
 *
 * We look at src/styles/ for non-vendored CSS files.
 */
function discoverStyles() {
  /** @type {Array<{ importPath: string; description: string }>} */
  const styles = [];

  const stylesDir = resolve(root, 'src/styles');

  // Top-level CSS files (skip vendored/), globals.css first
  if (existsSync(stylesDir)) {
    const cssFiles = readdirSync(stylesDir)
      .filter((f) => statSync(resolve(stylesDir, f)).isFile() && f.endsWith('.css'))
      .sort((a, b) => {
        if (a === 'globals.css') return -1;
        if (b === 'globals.css') return 1;
        return a.localeCompare(b);
      });
    for (const f of cssFiles) {
      const importPath = f === 'globals.css'
        ? './styles (or ./styles/globals.css)'
        : `./styles/${f}`;
      const description = describeStyleFile(f, '');
      styles.push({ importPath, description });
    }
  }

  // Canary subdirectory
  const canaryDir = resolve(stylesDir, 'canary');
  if (existsSync(canaryDir)) {
    for (const f of readdirSync(canaryDir)) {
      if (f.endsWith('.css')) {
        styles.push({
          importPath: `./styles/canary/${f}`,
          description: describeStyleFile(f, 'Canary '),
        });
      }
    }
  }

  return styles;
}

function describeStyleFile(filename, prefix) {
  if (filename === 'globals.css') {
    return prefix
      ? `${prefix}theme overrides`
      : 'Nominal theme &#8212; Tailwind, CSS custom properties, sidebar/typography/layout tokens';
  }
  if (filename.includes('ag-theme')) return `${prefix}AG Grid theme`;
  return `${prefix}${filename}`;
}

// ---------------------------------------------------------------------------
// 3. Count assets
// ---------------------------------------------------------------------------

function countFiles(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => statSync(resolve(dir, f)).isFile()).length;
}

// ---------------------------------------------------------------------------
// 4. Generate MDX
// ---------------------------------------------------------------------------

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function code(s) {
  return `<code>${esc(s)}</code>`;
}

function generateSection() {
  const today = new Date().toISOString().slice(0, 10);
  const pkgJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
  const pkgName = pkgJson.name;

  const lines = [];
  const ln = (s = '') => lines.push(s);

  ln(`## Current Content as of ${today}`);
  ln();
  ln('### Components (JS/TS)');
  ln();
  ln('Each entry point ships as ESM (`.js`), CJS (`.cjs`), and TypeScript declarations (`.d.ts`).');

  // Entry points from vite.config.ts build.lib.entry
  const entryPoints = [
    { file: 'src/index.ts', subpath: '' },
    { file: 'src/canary.ts', subpath: '/canary' },
    { file: 'src/extras.ts', subpath: '/extras' },
  ];

  for (const ep of entryPoints) {
    const fullPath = resolve(root, ep.file);
    if (!existsSync(fullPath)) continue;

    const label = entryPointLabel(fullPath);
    const importPath = ep.subpath ? `${pkgName}${ep.subpath}` : pkgName;
    const sections = parseEntryPoint(fullPath);

    ln();
    ln(`#### \`${importPath}\` &#8212; ${label}`);
    ln();
    ln('<table>');
    ln('  <thead>');
    ln('    <tr><th>Layer</th><th>Exports</th></tr>');
    ln('  </thead>');
    ln('  <tbody>');

    for (const [section, names] of sections) {
      const namesCodes = names.map((n) => code(n)).join(', ');
      ln('    <tr>');
      ln(`      <td>${esc(section)}</td>`);
      ln(`      <td>${namesCodes}</td>`);
      ln('    </tr>');
    }

    ln('  </tbody>');
    ln('</table>');
  }

  // Styles
  ln();
  ln('### Styles (CSS)');
  ln();
  ln('<table>');
  ln('  <thead>');
  ln('    <tr><th>Import path</th><th>Content</th></tr>');
  ln('  </thead>');
  ln('  <tbody>');

  for (const s of discoverStyles()) {
    ln('    <tr>');
    ln(`      <td>${code(s.importPath)}</td>`);
    ln(`      <td>${s.description}</td>`);
    ln('    </tr>');
  }

  ln('  </tbody>');
  ln('</table>');

  // Assets
  const nominalCount = countFiles(resolve(root, 'public/images'));
  const canaryCount = countFiles(resolve(root, 'public/canary/images'));

  ln();
  ln('### Assets (images)');
  ln();
  ln('<table>');
  ln('  <thead>');
  ln('    <tr><th>Import path</th><th>Content</th></tr>');
  ln('  </thead>');
  ln('  <tbody>');
  ln('    <tr>');
  ln(`      <td>${code('./assets/images/*')}</td>`);
  ln(`      <td>${nominalCount} files &#8212; brand logos, decorative elements, theme icons</td>`);
  ln('    </tr>');
  ln('    <tr>');
  ln(`      <td>${code('./assets/canary/images/*')}</td>`);
  ln(`      <td>${canaryCount} files &#8212; Canary-branded equivalents</td>`);
  ln('    </tr>');
  ln('  </tbody>');
  ln('</table>');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// 5. Splice into the MDX file
// ---------------------------------------------------------------------------

const mdx = readFileSync(MDX_PATH, 'utf-8');
const startIdx = mdx.indexOf(START_MARKER);
const endIdx = mdx.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  console.error('ERROR: Could not find AUTO-GENERATED markers in', relative(root, MDX_PATH));
  process.exit(1);
}

// Find end of the START_MARKER line
const startLineEnd = mdx.indexOf('\n', startIdx);
const before = mdx.slice(0, startLineEnd + 1);
const after = mdx.slice(endIdx);

const generated = generateSection();
const result = `${before}\n${generated}\n\n${after}`;

writeFileSync(MDX_PATH, result, 'utf-8');
console.log(`✓ Updated "Current Content" section in ${relative(root, MDX_PATH)}`);
