# Stage 1: Install dependencies and build
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy workspace packages (needed for monorepo build)
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the Next.js app
WORKDIR /app/apps/web
RUN pnpm build

# Stage 2: Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Copy Next.js built files
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set production environment
ENV NODE_ENV=production

# Expose Next.js default port
EXPOSE 3000

# Start Next.js
CMD ["node", "apps/web/server.js"]
