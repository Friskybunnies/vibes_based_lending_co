# Vibes-Based Lending Co.

Purpose: A simple form for getting that ca$$h moneyyyyy (if the lender [me] feels like it 💅)

Technologies: React, Vite, Express.

Details: With current configuration, UI and API are served by two separate processes in dev and a single process in production.

## Local

**Node 20+**

Set env vars `WORKFLOW_TOKEN` and `WORKFLOW_SECRET` in **`backend/.env`**. (Optional `PORT`; otherwise, default `3001`.)

```bash
# terminal 1
cd backend && npm install && node index.js

# terminal 2
cd frontend && npm install && npm run dev
```

Visit the app in the browser at **http://localhost:5173**.

## Railway

- Use the repo root **Dockerfile**; set **`WORKFLOW_TOKEN`** and **`WORKFLOW_SECRET`** in Railway Variables.
