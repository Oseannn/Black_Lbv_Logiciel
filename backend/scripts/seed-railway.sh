#!/bin/bash
set -e

echo "🌱 Starting database seeding on Railway..."

# Run the seed script
npx ts-node prisma/seed.ts

echo "✅ Seed completed successfully!"
