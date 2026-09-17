#!/usr/bin/env bash
# Routes local vitest runs through the fleet's compute-slot.sh admission gate so
# a local test run is visible to it, instead of contending unseen. CI bypasses
# this entirely — a dedicated runner has no fleet to contend with.
set -euo pipefail

WORKERS=2

if [ -n "${CI:-}" ]; then
  exec npx vitest --run "$@"
fi

CS=/Users/jmp/code/arda/scratch/compute-slot.sh
if [ -x "$CS" ]; then
  CORES="$WORKERS" exec bash "$CS" run "${CS_OWNER:-frontend-tests}" ux-prototype-vitest 10 -- \
    npx vitest --run --maxWorkers="$WORKERS" "$@"
fi

exec npx vitest --run --maxWorkers="$WORKERS" "$@"
