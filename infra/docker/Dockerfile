# OpenFlags — All-in-one image (Bun API + Dashboard static files)
# Build from repo root:  docker build -f infra/docker/Dockerfile -t openflags .
#
# Run:
#   docker run -d \
#     -p 4000:4000 \
#     -v openflags_data:/app/data \
#     -e CORS_ORIGIN=http://localhost:4000 \
#     openflags

# ── Stage 1: Build dashboard ──────────────────────────────────────
FROM oven/bun:1 AS dashboard-builder
WORKDIR /app

COPY . .
RUN bun install

WORKDIR /app/apps/dashboard
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN bun run build

# ── Stage 2: Runtime ──────────────────────────────────────────────
FROM oven/bun:1 AS runtime
WORKDIR /app

# Copy workspace layout and lockfile
COPY package.json bun.lockb* ./
COPY apps/server/package.json apps/server/
COPY packages/types/package.json packages/types/

RUN bun install

# Copy server and types source
COPY apps/server apps/server
COPY packages/types packages/types

# Copy pre-built dashboard
COPY --from=dashboard-builder /app/apps/dashboard/dist /app/public

WORKDIR /app/apps/server

ENV PORT=4000
ENV CORS_ORIGIN=http://localhost:4000
ENV DASHBOARD_DIR=/app/public

# Persist SQLite data — mount a volume at /app/data
RUN mkdir -p /app/data
ENV DATA_DIR=/app/data

EXPOSE 4000
CMD ["bun", "run", "src/index.ts"]
