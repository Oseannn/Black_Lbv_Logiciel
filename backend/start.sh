#!/bin/bash
set -e

echo "🔄 Starting application..."

# Try to run migrations but don't fail if it errors
echo "📦 Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Migration warning (continuing anyway)"

# Start the application
echo "🚀 Starting NestJS application..."
npm run start:prod
