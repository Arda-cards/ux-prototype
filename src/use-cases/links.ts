/// <reference types="vite/client" />

/**
 * Resolves a documentation site path to a full URL.
 * In development, points to localhost:4321 (Astro dev server).
 * In production, points to the GitHub Pages deployment.
 */
export function docsUrl(path: string): string {
  const base = import.meta.env.DEV
    ? 'http://localhost:4321'
    : 'https://arda-cards.github.io/documentation';
  return `${base}${path}`;
}
