FROM node:22

# Set environment variables
ENV NODE_ENV=production

# Enable corepack (for pnpm)
RUN corepack enable

WORKDIR /app

# Copy everything from the repo
COPY . .

# Install dependencies
RUN pnpm install

# Build only the target app
RUN pnpm turbo run build --filter=tb

# Expose port
EXPOSE 3000

# Start the app
CMD ["pnpm", "turbo", "run", "start", "--filter=tb"]
