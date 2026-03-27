FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api-documentation/package.json ./apps/api-documentation/
COPY packages/ ./packages/
RUN pnpm install --no-frozen-lockfile

# --- Build the app ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/ ./
COPY . .
RUN pnpm --filter openldr-api-docs build

# --- Production runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/api-documentation/.next/standalone ./
COPY --from=builder /app/apps/api-documentation/.next/static ./apps/api-documentation/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/api-documentation/server.js"]
