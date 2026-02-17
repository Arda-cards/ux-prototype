// watch-rebuild.js — preview orchestrator.
// Starts the server in the background, watches src/ for changes (5s debounce),
// accepts Space/Enter for immediate rebuild, and Ctrl+C to shut down cleanly.
import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { extname } from 'node:path';

const WATCHED_EXTENSIONS = new Set(['.ts', '.tsx', '.mdx', '.css', '.json']);
const DEBOUNCE_MS = 5000;
const PORT = process.env.PORT || 8080;
const SEPARATOR = '─'.repeat(62);

/* ------------------------------------------------------------------ */
/*  Server management                                                  */
/* ------------------------------------------------------------------ */

let serverProcess = null;

function startServer() {
  serverProcess = spawn('node', ['tools/server.js'], { stdio: 'inherit' });
  serverProcess.on('error', (err) => console.error('[server] Failed to start:', err.message));
  serverProcess.on('close', (code) => {
    // Only log if we didn't kill it ourselves
    if (serverProcess) console.log(`[server] Exited (code ${code}).`);
    serverProcess = null;
  });
}

function stopServer() {
  if (serverProcess) {
    const p = serverProcess;
    serverProcess = null; // prevent "Exited" log during shutdown
    p.kill('SIGTERM');
  }
}

/* ------------------------------------------------------------------ */
/*  Rebuild logic                                                      */
/* ------------------------------------------------------------------ */

let timer = null;
let building = false;
let pendingRebuild = false;

function rebuild() {
  if (building) {
    pendingRebuild = true;
    return;
  }
  // Cancel any pending debounce
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  building = true;
  console.log('\n[watch] Rebuilding Storybook...');
  const child = spawn('npm', ['run', 'build-storybook'], { stdio: 'inherit' });
  child.on('close', (code) => {
    building = false;
    if (code === 0) {
      console.log('[watch] Rebuild complete. Refresh browser to see changes.');
    } else {
      console.error(`[watch] Build failed (exit ${code}).`);
    }
    printInstructions();
    if (pendingRebuild) {
      pendingRebuild = false;
      rebuild();
    }
  });
}

function scheduleRebuild(filename) {
  if (filename && !WATCHED_EXTENSIONS.has(extname(filename))) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(rebuild, DEBOUNCE_MS);
}

/* ------------------------------------------------------------------ */
/*  Stdin — Space/Enter = immediate rebuild                            */
/* ------------------------------------------------------------------ */

function printInstructions() {
  console.log(`
${SEPARATOR}
  Storybook Preview Server
${SEPARATOR}

  Server:    http://localhost:${PORT}  (basic-auth: arda / <secret>)
  Watching:  src/**/*.{ts,tsx,mdx,css,json}
  Debounce:  ${DEBOUNCE_MS / 1000}s after last file change

  Keyboard shortcuts:
    Space / Enter   Trigger an immediate rebuild
    Ctrl+C          Stop the server and exit

${SEPARATOR}
`);
}

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (key) => {
    if (key === '\u0003') {
      // Ctrl+C
      shutdown();
    } else if (key === ' ' || key === '\r' || key === '\n') {
      rebuild();
    }
  });
}

/* ------------------------------------------------------------------ */
/*  File watcher                                                       */
/* ------------------------------------------------------------------ */

watch('src', { recursive: true }, (_event, filename) => scheduleRebuild(filename));

/* ------------------------------------------------------------------ */
/*  Graceful shutdown                                                  */
/* ------------------------------------------------------------------ */

function shutdown() {
  console.log('\n[watch] Shutting down...');
  stopServer();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/* ------------------------------------------------------------------ */
/*  Start                                                              */
/* ------------------------------------------------------------------ */

startServer();
printInstructions();
