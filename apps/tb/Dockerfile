

FROM node:22

ENV NODE_ENV=production

# Enable specific version of pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app
COPY . .

# Install with frozen lockfile (now compatible)
RUN pnpm install --frozen-lockfile --prod=false

# Build the app
RUN pnpm turbo run build --filter=tb

EXPOSE 3000
CMD ["pnpm", "turbo", "run", "start", "--filter=tb"]
