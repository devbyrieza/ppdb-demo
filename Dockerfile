# Stage 1: Dependencies
FROM node:20-slim AS deps
ARG DATABASE_URL
RUN apt-get update -y && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN npm install -g pnpm

# Copy package files first for better cache utilization
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
RUN npx prisma generate

# Stage 2: Build
FROM node:20-slim AS builder
ARG DATABASE_URL
RUN apt-get update -y && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code
COPY . .

ENV NODE_ENV=production
RUN npx prisma generate

# Build with optimization
RUN echo "BUILD_TIMESTAMP=$(date +%s)" > .buildinfo
RUN pnpm build

# Stage 3: Production runner
FROM node:20-slim AS runner
RUN apt-get update -y && apt-get install -y openssl libssl3 curl wget && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV WABLAS_TOKEN=kTrgeA9v6F4jF2Jj5JJEiZI3ficNtnYPgdIJUCR9AyFwwzVyJgKw2zy
ENV WABLAS_SECRET_KEY=qpdqYZiu

RUN addgroup --system --gid 1001 nodejs &&     adduser --system --uid 1001 nextjs

# Create writable directories for nextjs user
RUN mkdir -p /app/.next && chown -R nextjs:nodejs /app

# Copy optimized build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.buildinfo ./.buildinfo
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["./docker-entrypoint.sh"]
