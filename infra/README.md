# OpenFlags — Self-hosted deployment

The easiest way to run OpenFlags on your own infra is **Docker Compose**: one URL for the dashboard and the API, SQLite data in a volume.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

## Quick start

From the **repository root**:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

- **Dashboard:** http://localhost:8080
- **API:** http://localhost:8080/api (same origin; the dashboard calls it automatically)

First visit: sign up with an email and password. The first user is an admin.

## Configuration

| Variable      | Default                 | Description                                                                                                 |
| ------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `CORS_ORIGIN` | `http://localhost:8080` | Allowed origin for cookies. Set to your public URL when behind a domain (e.g. `https://flags.example.com`). |

Example with a custom origin:

```bash
CORS_ORIGIN=https://flags.example.com docker compose -f infra/docker/docker-compose.yml up -d
```

## Data

- SQLite is stored in a Docker volume `server_data`.
- To back up: copy the volume (e.g. from the server container’s `/app/apps/server/data`).
- To reset: `docker compose -f infra/docker/docker-compose.yml down -v` (removes the volume).

## Build only (no Compose)

```bash
# From repo root
docker build -f infra/docker/Dockerfile.server -t openflags-server .
docker build -f infra/docker/Dockerfile.dashboard -t openflags-dashboard --build-arg VITE_API_URL=/api .
```

Run the server with a volume for `data`, then put a reverse proxy (e.g. nginx, Caddy) in front that serves the dashboard and proxies `/api` to the server.
