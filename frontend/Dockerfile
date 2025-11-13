# =============================================================================
# Frontend Dockerfile for Development with Hot-Reload (HMR)
# =============================================================================
# This Dockerfile builds a development image for the React/Vite frontend.
# It uses Vite's dev server with Hot Module Replacement (HMR), so code changes
# are automatically detected and the browser updates without full page reloads.
#
# Key Features:
# - Multi-stage caching: package.json is copied first to cache npm install
# - Hot-reload (HMR): Vite watches for file changes and updates the browser
# - Bind mounts: Source code is mounted from host (see docker-compose.yml)
# - Named volumes: node_modules are isolated in a volume
# - Host 0.0.0.0: Required for Vite to be accessible outside the container
#
# This image should NOT be used for production. For production, use a
# multi-stage build that runs `npm run build` and serves static files.
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
# For development, we need devDependencies (vite, @vitejs/plugin-react, etc.)
RUN npm install

# -----------------------------------------------------------------------------
# Stage 3: Copy Application Code
# -----------------------------------------------------------------------------
# Copy the rest of the frontend source code
# In development, this layer is mostly ignored because we use bind mounts
# But we copy it anyway so the image can run standalone if needed
COPY . .

# -----------------------------------------------------------------------------
# Stage 4: Expose Port
# -----------------------------------------------------------------------------
# Expose port 3000 for the Vite dev server
# This is a documentation feature - docker-compose.yml handles actual mapping
EXPOSE 3000

# -----------------------------------------------------------------------------
# Stage 5: Start Development Server
# -----------------------------------------------------------------------------
# Run Vite's dev server for hot-reload (HMR) development
# Vite will:
# 1. Watch for file changes in the mounted source code
# 2. Use HMR to update the browser without full page reloads
# 3. Serve the app on http://0.0.0.0:3000 (accessible from outside container)
#
# CRITICAL: This command enables hot-reload. When you edit a .tsx/.ts file on
# your host machine, the bind mount syncs the change to the container, and
# Vite detects the change and updates the browser via HMR automatically.
#
# The vite.config.ts file MUST have `server.host: '0.0.0.0'` for this to work.
CMD ["npm", "run", "dev"]
