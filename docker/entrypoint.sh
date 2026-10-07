#!/bin/sh
set -e

# SchoolLens container entrypoint.
# - points the SQLite DB at the persistent volume
# - applies the Prisma schema
# - seeds demo data on first run only (when the DB has no schools)
# - starts the Next.js standalone server

# Default the API key if not provided (dev only). Production MUST set it.
: "${SCHOOLLENS_INTERNAL_API_KEY:=dev-secret-change-me}"
export SCHOOLLENS_INTERNAL_API_KEY

# Keep the DB on the persistent volume so comments survive rebuilds.
DB_DIR="/app/data"
DB_FILE="${DB_DIR}/dev.db"
mkdir -p "${DB_DIR}"
export DATABASE_URL="file:${DB_FILE}"

echo "▶ Applying Prisma schema to ${DB_FILE} ..."
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss=false

# Seed only on first run (DB has no schools yet).
SCHOOL_COUNT=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.school.count().then(n => { console.log(n); return p.\$disconnect(); })
    .catch(() => { console.log(0); process.exit(0); });
" 2>/dev/null || echo 0)

if [ "${SCHOOL_COUNT}" = "0" ]; then
  echo "▶ First run: seeding demo data ..."
  node prisma/seed.js
else
  echo "▶ DB already has ${SCHOOL_COUNT} school(s) — skipping seed."
fi

echo "▶ Starting SchoolLens on :${PORT:-3000} ..."
exec node server.js