# Single service: build Vite → dist, run Express (serves API + static UI)
FROM node:20-alpine
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
RUN cd frontend && npm run build

COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend ./backend

ENV NODE_ENV=production
CMD ["node", "backend/index.js"]
