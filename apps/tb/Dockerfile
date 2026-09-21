FROM node:22

# Production build only — never run the dev server in the image.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# corepack needs root to install the pnpm shim pinned by package.json#packageManager
RUN corepack enable

WORKDIR /app

# Copy the monorepo owned by the unprivileged `node` user (uid 1000) and drop
# root privileges before installing/building. Everything after this line runs
# as `node`, so a future RCE in the app cannot write outside /app or escalate.
COPY --chown=node:node . .
USER node

# No secrets are baked into the image: all keys (CLERK_SECRET_KEY, OPENAI_API_KEY,
# RESEND_API_KEY, ...) must be provided at runtime by the platform environment.
# Build-time NEXT_PUBLIC_* values are injected by Coolify as build args.

RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm turbo run build --filter=tb

EXPOSE 3000
CMD ["pnpm", "--filter=tb", "start"]
