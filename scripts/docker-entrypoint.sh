#!/bin/sh
set -e

# Invoke prisma via its package entry point, not the .bin/ shim. Newer
# Prisma releases load `prisma_schema_build_bg.wasm` relative to the
# entry-point's __dirname; the .bin shim resolves __dirname to .bin/
# where the wasm is not present, breaking with:
#   ENOENT: ... /app/node_modules/.bin/prisma_schema_build_bg.wasm
echo "Running database migrations..."
node ./node_modules/prisma/build/index.js migrate deploy
echo "Migrations complete. Starting app..."

exec "$@"
