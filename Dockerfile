# ─── Build stage ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install bun for faster installs
RUN npm install -g bun

# Copy dependency manifests
COPY package.json bun.lockb ./

# Install dependencies (production + dev for build)
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_APP_ENV=production
ARG VITE_APP_VERSION=0.0.0

RUN bun run build

# ─── Production stage ──────────────────────────────────────────
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing + security headers
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
