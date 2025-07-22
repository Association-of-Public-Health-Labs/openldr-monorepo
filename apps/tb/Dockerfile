FROM node:22

# Set environment variables
ENV NODE_ENV=production

# Enable corepack (for pnpm)
RUN corepack enable

WORKDIR /app

# Copy everything from the repo
COPY . .

# Install all dependencies (including devDependencies for Turbo)
RUN pnpm install --frozen-lockfile --prod=false

# Build only the target app
RUN pnpm turbo run build --filter=tb

# Expose port
EXPOSE 3000

# Start the app
CMD ["pnpm", "turbo", "run", "start", "--filter=tb"]
