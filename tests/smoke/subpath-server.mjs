/**
 * Minimal HTTP server that serves storybook-static under a configurable subpath.
 *
 * Usage:
 *   node tests/smoke/subpath-server.mjs [port] [prefix]
 *
 * Defaults: port=6007, prefix=/ux-prototype/
 *
 * Requests to /ux-prototype/... are mapped to storybook-static/...
 * All other requests get a 404. The server prints "READY" to stdout
 * when it's listening, so callers can wait for that signal.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '../../storybook-static');

const PORT = parseInt(process.argv[2] || '6007', 10);
const PREFIX = process.argv[3] || '/ux-prototype/';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;

  // Only serve files under the prefix
  if (!pathname.startsWith(PREFIX)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  // Strip prefix to get the relative file path
  let relPath = pathname.slice(PREFIX.length);
  if (relPath === '' || relPath.endsWith('/')) {
    relPath += 'index.html';
  }

  const filePath = join(ROOT, relPath);

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`READY — serving ${ROOT} at http://localhost:${PORT}${PREFIX}`);
});
