# Vibes-Based Lending Co.

Full-stack: React (Vite) + Express, Alloy sandbox. Production build is a single app (API + static UI on one process).

## Local dev

**Terminal 1 — API**
```bash
cd backend
npm install
node index.js
```

**Terminal 2 — Vite**
```bash
cd frontend
npm install
npm run dev
```

The app calls `http://localhost:3001` in dev. Open the URL Vite prints (usually `http://localhost:5173`).

## Railway (deploy)

### Option A — Dockerfile (recommended)

This repo includes a **root `Dockerfile`**. Railway auto-detects it and builds without using Railpack on the bare monorepo layout.

1. New project → deploy this repo.
2. Leave **Root Directory** empty (repo root), or confirm the service uses the **Dockerfile** build.
3. **Variables** (service → Variables):
   - `WORKFLOW_TOKEN` — Alloy workflow token
   - `WORKFLOW_SECRET` — Alloy workflow secret
   - Optional: `CORS_ORIGIN` — only if you split the UI and API; same-origin on Railway you usually do not need it.

4. **Generate domain:** Settings → Generate domain. One URL serves both the React app and `/api/*`.

5. `PORT` is set by Railway; do not override it.

After deploy, the UI uses **relative** `/api/...` (no `VITE_API_URL` needed). For local Vite, the app still uses `http://localhost:3001` in dev when `VITE_API_URL` is unset.

### Option B — No Docker: root directory = `backend`

If you don’t use the Dockerfile, Railpack will not treat the repo root as a buildable app. Use **one** service and:

1. **Settings → Root Directory** → set to **`backend`**.
2. **Build command:**
   `cd ../frontend && npm ci && npm run build && cd ../backend && npm ci`
3. **Start command:** `node index.js`
4. Same env vars as above.

The build command compiles the frontend from the sibling `frontend/` folder, then installs backend dependencies.

## Layout

- `frontend/` — Vite + React; `npm run build` → `frontend/dist/`
- `backend/` — Express. If `frontend/dist` exists, static files and SPA fallback are served from the same server.
