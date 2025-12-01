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

# Copy and set entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# -----------------------------------------------------------------------------
# Stage 4: Expose Port
# -----------------------------------------------------------------------------
# Expose port 3001 for the Express server
# This is a documentation feature - docker-compose.yml handles actual mapping
EXPOSE 3001

# -----------------------------------------------------------------------------
# Stage 5: Start Development Server
# -----------------------------------------------------------------------------
# Use entrypoint script to run migrations, seeds, and start dev server
# The entrypoint script will:
# 1. Wait for database to be ready
# 2. Run database migrations
# 3. Optionally run seeds (if SEED_DB=true)
# 4. Start ts-node-dev for hot-reload development
CMD ["docker-entrypoint.sh"]
