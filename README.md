# Vibes-Based Lending Co.

React + Vite, Express, Alloy sandbox. In production, one process serves the built UI and `/api/*`.

## Local

Terminal 1:
```bash
cd backend && npm install && node index.js
```

Terminal 2:
```bash
cd frontend && npm install && npm run dev
```

App talks to the API on port 3001; open the URL Vite prints (5173).

## Railway

Use the root **Dockerfile** (leave root directory as the repo, or pick Docker in settings). Set `WORKFLOW_TOKEN` and `WORKFLOW_SECRET` in Variables.

**Plan B** if you skip Docker: root directory = `backend`, build  
`cd ../frontend && npm ci && npm run build && cd ../backend && npm ci`,  
start `node index.js`.

Same-origin in prod, so you usually don’t need `CORS_ORIGIN` or `VITE_API_URL`.
