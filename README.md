# Event Management API

Small Express + Prisma API for creating events and managing user registrations.

## Quick info

- Project root: e:\Web Dev\jobtasks\EvevntManagementApi
- Main server: `src/server.js`
- Controllers: `src/controllers/event.controller.js`
- Routes: `src/routes/event.routes.js`
- Prisma schema: `prisma/schema.prisma`
- DB client config: `src/config/db.js`
- Seed script: `prisma/seed.js`

## Prerequisites

- Node.js (recommend >= 18)
- npm
- Docker (for the provided docker-compose option)

## Environment

Create a `.env` at project root with at least:

```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:DOCKER_RUNNING_PORT/DATABASE_NAME"

PORT=3000
```

## Install & run (recommended)

1. Install deps:

```bash
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Start services and server (dev script starts docker-compose + nodemon):

```bash
npm run dev
```

This will start Postgres (via docker-compose) and the API server (nodemon).

## Run without docker

- Ensure a Postgres instance is running and `DATABASE_URL` points to it.
- Run seed (optional):

```bash
npm run seed
```

- Start server:

```bash
node src/server.js
# or set PORT and run:
# PowerShell: $env:PORT="5000"; node src/server.js
# CMD: set PORT=5000 && node src/server.js
```

## Seed data

Creates sample users and events:

```bash
npm run seed
```

## Available endpoints

Base path: `/events`

- POST /events
  - Create event
  - Body: { title, date, location, capacity }
- POST /events/register
  - Register a user to an event
  - Body: { eventId, userId }
- POST /events/cancel
  - Cancel registration
  - Body: { eventId, userId }
- GET /events/upcoming
  - List upcoming events
- GET /events/:id/stats
  - Event statistics (registrations, remaining capacity)
- GET /events/:id
  - Get event details (includes registration list)

## Notes / tips

- package.json contains scripts:
  - `dev` — runs docker-compose up -d then `nodemon src/server.js`
  - `seed` — runs `node prisma/seed.js`
- If you change Prisma models, run:

```bash
npx prisma migrate dev
npx prisma generate
```
