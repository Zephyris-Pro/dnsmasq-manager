FROM node:18-alpine AS frontend-build

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci 2>/dev/null || npm install
COPY frontend/ .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

COPY backend/server.js .

COPY --from=frontend-build /frontend/dist ./public/

EXPOSE 3000

CMD ["node", "server.js"]
