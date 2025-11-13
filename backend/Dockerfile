# =============================================================================
# Backend Dockerfile for Development with Hot-Reload
# =============================================================================
# This Dockerfile builds a development image for the Node.js/Express backend.
# It uses ts-node-dev to provide hot-reload functionality, so code changes
# are automatically detected and the server restarts without rebuilding.
#
# Key Features:
# - Multi-stage caching: package.json is copied first to cache npm install
# - Hot-reload: ts-node-dev watches for file changes
# - Bind mounts: Source code is mounted from host (see docker-compose.yml)
# - Named volumes: node_modules are isolated in a volume
#
# This image should NOT be used for production. For production, use a
# multi-stage build that compiles TypeScript and runs compiled JavaScript.
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base Image
# -----------------------------------------------------------------------------
# Use Node.js 18 on Alpine Linux for a lightweight image
# Alpine is ~5MB vs ~100MB+ for standard Node images
FROM node:18-alpine

# Set working directory inside the container
# All subsequent commands will run from this directory
WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Install Dependencies
# -----------------------------------------------------------------------------
# Copy package.json and package-lock.json first
# This allows Docker to cache the npm install layer
# If package.json doesn't change, this layer is reused (faster builds)
COPY package*.json ./

# Install dependencies
# --only=production would skip devDependencies (not suitable for dev)
# For development, we need devDependencies (ts-node-dev, TypeScript, etc.)
RUN npm install

# -----------------------------------------------------------------------------
# Stage 3: Copy Application Code
# -----------------------------------------------------------------------------
# Copy the rest of the backend source code
# In development, this layer is mostly ignored because we use bind mounts
# But we copy it anyway so the image can run standalone if needed
COPY . .

# -----------------------------------------------------------------------------
# Stage 4: Expose Port
# -----------------------------------------------------------------------------
# Expose port 3001 for the Express server
# This is a documentation feature - docker-compose.yml handles actual mapping
EXPOSE 3001

# -----------------------------------------------------------------------------
# Stage 5: Start Development Server
# -----------------------------------------------------------------------------
# Run ts-node-dev for hot-reload development
# --respawn: Restart on file changes
# --transpile-only: Skip type checking for faster restarts (use IDE for types)
# src/server.ts: Entry point for the backend application
#
# CRITICAL: This command enables hot-reload. When you edit a .ts file on your
# host machine, the bind mount syncs the change to the container, and
# ts-node-dev detects the change and restarts the server automatically.
CMD ["npm", "run", "dev"]
