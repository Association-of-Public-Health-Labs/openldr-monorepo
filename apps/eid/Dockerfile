FROM node:22

# Production build only — never run the dev server in the image.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# corepack needs root to install the pnpm shim pinned by package.json#packageManager
RUN corepack enable

# /app itself must belong to `node`: WORKDIR creates it as root and
# COPY --chown only chowns the copied files, not the directory (pnpm writes
# temp files directly into /app during install).
RUN mkdir -p /app && chown node:node /app
WORKDIR /app

# Copy the monorepo owned by the unprivileged `node` user (uid 1000) and drop
# root privileges before installing/building. Everything after this line runs
# as `node`, so a future RCE in the app cannot write outside /app or escalate.
COPY --chown=node:node . .
USER node

# No secrets are baked into the image: secrets (CLERK_SECRET_KEY, RESEND_API_KEY, ...)
# are runtime-only and must be provided by the platform environment.
# NEXT_PUBLIC_* values are build-time variables: `next build` inlines them, so they must be
# available at build time (Coolify build-time variables).

RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm turbo run build --filter=eid

EXPOSE 3000
CMD ["pnpm", "--filter=eid", "start"]
