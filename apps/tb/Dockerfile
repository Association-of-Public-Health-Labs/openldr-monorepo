
FROM node:22

ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm turbo run build --filter=tb

EXPOSE 3000
CMD ["pnpm", "turbo", "run", "start", "--filter=tb"]

