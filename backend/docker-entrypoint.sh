#!/bin/sh
# Backend Docker Entrypoint Script
# This script runs migrations and seeds before starting the development server

set -e  # Exit on error

echo "==================================="
echo "Backend Container Starting..."
echo "==================================="

# Wait for database to be ready (healthcheck should handle this, but extra safety)
echo "Waiting for database to be ready..."
sleep 5

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Check if we should run seeds (only if SEED_DB is set to true)
if [ "${SEED_DB:-false}" = "true" ]; then
  echo "Running database seeders..."
  npm run db:seed:all
fi

# Start the development server
echo "Starting development server..."
exec npm run dev
