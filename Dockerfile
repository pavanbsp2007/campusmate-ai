# ========================================================
# CampusMate AI - Multi-Stage Production Dockerfile
# Builds client and packages complete unified Node.js server
# ========================================================

# --- Stage 1: Build React Client ---
FROM node:22-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# --- Stage 2: Production Server & Static Assets ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy server source code and database assets
COPY server/ ./
COPY database/ /app/database/

# Copy compiled frontend from Stage 1 into client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose server port
EXPOSE 5000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/index.js"]
