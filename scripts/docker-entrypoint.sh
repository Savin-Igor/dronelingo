#!/bin/sh
set -e

# Invoke prisma via its package entry point, not the .bin/ shim. Newer
# Prisma releases load `prisma_schema_build_bg.wasm` relative to the
# entry-point's __dirname; the .bin shim resolves __dirname to .bin/
# where the wasm is not present, breaking with:
#   ENOENT: ... /app/node_modules/.bin/prisma_schema_build_bg.wasm
echo "Running database migrations..."
node ./node_modules/prisma/build/index.js migrate deploy

# Idempotent upsert of every topic / lesson / question on each start
# so a redeploy with new content lands in the DB without an extra
# manual step. Takes ~5 s for the current ~100-question bank.
echo "Importing content..."
node ./node_modules/tsx/dist/cli.mjs scripts/import-content.ts

echo "Startup tasks complete. Starting app..."

exec "$@"
