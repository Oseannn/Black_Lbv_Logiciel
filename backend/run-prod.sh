#!/bin/bash

# Production-run script (not overwritten by Nixpacks)
# Prints debug info and runs migrations non-blocking, then starts app

echo "🔄 run-prod: Starting application (debug mode)..."

echo "--- ENV SUMMARY ---"
echo "NODE_ENV=${NODE_ENV:-(not set)}"
echo "PORT=${PORT:-(not set)}"
if [ -n "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is set"
else
  echo "DATABASE_URL is NOT set"
fi
if [ -n "${JWT_SECRET:-}" ]; then
  echo "JWT_SECRET is set"
else
  echo "JWT_SECRET is NOT set"
fi

echo "--------------------"

echo "📦 Node version and npm version"
node -v || true
npm -v || true

echo "🗂 Checking build output (dist)"
ls -la dist || true

echo "📦 Running database migrations (will continue on error)"
npx prisma migrate deploy 2>&1 || echo "⚠️  Migration warning (continuing anyway)"

echo "🚀 Starting NestJS application (exec)..."
exec npm run start:prod
