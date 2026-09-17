#!/usr/bin/env bash
# Routes local vitest runs through the fleet's compute-slot.sh admission gate so
# a local test run is visible to it, instead of contending unseen. A GitHub
# Actions runner bypasses this entirely — a dedicated runner has no fleet to
# contend with. Checked via GITHUB_ACTIONS rather than the generic CI var,
# since developers are told to set CI=true locally for other reasons, which
# would otherwise also defeat this gate.
set -euo pipefail

WORKERS=2

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  exec npx vitest --run "$@"
fi

# No default here (MP, arda-frontend-app#1337): a checked-in script asserting
# one engineer's workspace layout would silently do nothing for anyone else,
# which is worse than an explicit opt-in. Unset falls through to the direct,
# capped invocation below -- the worker cap survives either way.
CS="${COMPUTE_SLOT_SH:-}"
if [ -n "$CS" ] && [ -f "$CS" ] && [ -r "$CS" ]; then
  CORES="$WORKERS" exec bash "$CS" run "${CS_OWNER:-frontend-tests}" ux-prototype-vitest 10 -- \
    npx vitest --run --maxWorkers="$WORKERS" "$@"
fi

exec npx vitest --run --maxWorkers="$WORKERS" "$@"
