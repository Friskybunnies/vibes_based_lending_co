# Vibes-Based Lending Co.

React (Vite) + Express. Alloy **sandbox** for evaluations. In production, one process serves the built UI and `/api/*`.

**Node 20+**

## Local

**`backend/.env`:** `WORKFLOW_TOKEN` and `WORKFLOW_SECRET` (or evaluations fail). Optional `PORT` (default `3001`).

```bash
# terminal 1
cd backend && npm install && node index.js

# terminal 2
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173**; the API is **:3001**. Override the API with `VITE_API_URL` in `frontend/.env` if you need to (see `frontend/.env.example`).

**Built UI only:** `cd frontend && npm run build`, then from the repo root `node backend/index.js` (same env as above; serves on `PORT` or 3001).

## Railway

- **Docker:** use the repo root + root **Dockerfile**; set **`WORKFLOW_TOKEN`** and **`WORKFLOW_SECRET`** in Variables.
- **No Docker:** set service root to **`backend`**, build  
  `cd ../frontend && npm ci && npm run build && cd ../backend && npm ci`,  
  start **`node index.js`**.

Same-origin in production — you normally omit **`CORS_ORIGIN`** and **`VITE_API_URL`**.
