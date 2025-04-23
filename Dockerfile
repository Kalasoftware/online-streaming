# Top-level Dockerfile for full stack (client + server + MongoDB)
# Use Docker Compose for full orchestration

# ----------- Backend (server) -----------
FROM node:18 AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production
COPY server/. ./

# ----------- Frontend (client) -----------
FROM node:18 AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --production
COPY client/. ./
RUN npm run build

# ----------- Production image -----------
FROM node:18-slim AS prod
WORKDIR /app
# Copy server
COPY --from=server-build /app/server ./server
# Copy client build output
COPY --from=client-build /app/client/build ./client/build

# Expose ports for server (e.g., 5000) and client (e.g., 3000 if needed)
EXPOSE 5000 3000

# Set environment variables (override in docker-compose.yml)
ENV NODE_ENV=production

# Start the backend server (adjust if your server entry is not server/app.js)
CMD ["node", "server/app.js"]
