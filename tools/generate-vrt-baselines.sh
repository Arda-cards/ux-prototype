#!/usr/bin/env bash
# generate-vrt-baselines.sh
#
# Builds Storybook, serves it on port 6006, and runs the Playwright VRT
# suite with --update-snapshots to capture (or refresh) baseline screenshots.
#
# Usage:
#   ./tools/generate-vrt-baselines.sh            # build + generate
#   SKIP_BUILD=1 ./tools/generate-vrt-baselines.sh  # reuse existing build

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PORT="${VRT_PORT:-6006}"

cd "${PROJECT_ROOT}"

# ---------- 1. Build Storybook (unless SKIP_BUILD is set) ----------
if [[ -z "${SKIP_BUILD:-}" ]]; then
  echo "==> Building Storybook..."
  npm run build-storybook
else
  echo "==> Skipping Storybook build (SKIP_BUILD=1)"
fi

if [[ ! -d storybook-static ]]; then
  echo "ERROR: storybook-static/ not found. Run without SKIP_BUILD." >&2
  exit 1
fi

# ---------- 2. Install Playwright browsers if needed ----------
if ! npx playwright install --dry-run chromium >/dev/null 2>&1; then
  echo "==> Installing Playwright Chromium browser..."
  npx playwright install chromium
fi

# ---------- 3. Serve + generate baselines ----------
echo "==> Starting http-server on port ${PORT} and generating baselines..."
npx concurrently -k -s first \
  "npx http-server storybook-static --port ${PORT} --silent" \
  "npx wait-on http://127.0.0.1:${PORT} && npx playwright test --project=vrt --update-snapshots"

echo ""
echo "==> Baselines saved to tests/vrt/__snapshots__/"
echo "    Review them, then commit."
