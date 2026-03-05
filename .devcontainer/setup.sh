#!/bin/bash
set -e

echo "=== MediaVault Dev Container Setup ==="

# Copy env if not exists
[ -f /workspace/.env ] || cp /workspace/.env.example /workspace/.env

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd /workspace/frontend && npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd /workspace/backend && npm install

# Run database migrations
echo "Running database migrations..."
cd /workspace/backend && npm run db:migrate 2>/dev/null || echo "Migration skipped (DB not ready)"

echo "=== Setup complete! ==="
echo "Run 'docker-compose up' to start all services"
