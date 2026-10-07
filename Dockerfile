# syntax=docker/dockerfile:1.7

# ── deps ────────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# OpenSSL is required by Prisma's query engine on Debian slim images.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ── builder ─────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env. The API key is NOT baked in — it is provided at runtime.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# Pre-compile the TS seed script to plain JS so the runner (which has no tsx)
# can run it with `node prisma/seed.js`. esbuild is already in devDeps.
RUN npx esbuild prisma/seed.ts --outfile=prisma/seed.js --platform=node --format=cjs

# ── runner ──────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user for safety.
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone server bundle (output: "standalone" in next.config.js).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma needs its schema + a client at runtime for migrations + queries.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Persistent volume for the SQLite database so comments survive rebuilds.
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
VOLUME ["/app/data"]

# Wait for the DB file, run migrations, seed once, then start the server.
COPY --chown=nextjs:nodejs docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]