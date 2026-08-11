# Omar Abusahmoud Portfolio

Premium one-page portfolio with a Next.js frontend and a Spring Boot API.

## Repository layout

```text
.
├── src/                         # Next.js app, components and client utilities
├── public/                      # Portfolio images, logos and static assets
├── scripts/                     # Frontend smoke tests
├── backend/
│   ├── src/main/java/...        # Spring Boot feature packages
│   ├── src/main/resources/      # Configuration and Flyway migrations
│   ├── scripts/                 # Local backend launchers
│   ├── compose.yaml             # Local PostgreSQL
│   └── pom.xml
├── docs/                        # Design references and project notes
└── package.json                 # Frontend commands
```

The frontend remains at the repository root and the backend is isolated in
`backend/`. This is a clean monorepo boundary and can be split into two Git
repositories later without moving application source files.

## Run locally

Frontend:

```powershell
npm install
npm run dev
```

Backend and PostgreSQL:

```powershell
cd backend
docker compose up -d postgres
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-local.ps1
```

The frontend runs at `http://localhost:3000`; the API runs at
`http://localhost:8081`.

Copy `.env.example` files to local `.env` files and keep all credentials out of
Git. The backend launcher loads `backend/.env` without printing its values.

## Validation

```powershell
# frontend
npm run format:check
npm run lint
npm run typecheck
npm run build

# backend
cd backend
mvn test
mvn -DskipTests compile
```

## Production shape

Use `omarcode.dev` for the frontend and `api.omarcode.dev` for the Spring Boot
API. Point the domains from Namecheap DNS to the selected hosting providers,
then set the production CORS, frontend URL, OAuth callbacks, database and
server-only integration variables on the backend host.

This repository includes `render.yaml` and `backend/Dockerfile` for a Render
web service. In Render, connect this repository and create the Blueprint. The
service uses `backend/` as its root directory and checks readiness at
`/api/v1/health`. Add a managed PostgreSQL database separately, then provide a
JDBC-formatted `DATABASE_URL` and the remaining values marked `sync: false`.
