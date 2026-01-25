#!/bin/bash

echo "🔄 Starting application (debug mode)..."

echo "--- ENV SUMMARY ---"
echo "NODE_ENV=${NODE_ENV:-(not set)}"
echo "PORT=${PORT:-(not set)}"
if [ -n "${DATABASE_URL:-}" ]; then
	echo "DATABASE_URL is set"
else
	echo "DATABASE_URL is NOT set"
fi
echo "--------------------"

echo "📁 Listing working directory"
pwd
ls -la

echo "📁 Listing backend directory contents"
ls -la ./ || true

echo "📦 Node version and npm version"
node -v || true
npm -v || true

echo "🗂 Checking build output (dist)"
ls -la dist || true

echo "📦 Running database migrations (will continue on error)"
npx prisma migrate deploy || echo "⚠️  Migration warning (continuing anyway)"

echo "🚀 Starting NestJS application (exec)..."
exec npm run start:prod
