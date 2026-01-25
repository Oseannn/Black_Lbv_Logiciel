# Dockerfile for Railway deployment
FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files AND prisma schema FIRST (needed for npm ci)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (ignore scripts to avoid prisma generate before schema is ready)
RUN npm ci --cache /tmp/.npm --ignore-scripts

# Generate Prisma client (now schema is available)
RUN npx prisma generate

# Copy rest of the application
COPY . .

# Build the application
RUN npm run build

# Create startup script with migration handling
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Running Prisma migrations..."' >> /app/start.sh && \
    echo 'npx prisma migrate deploy 2>&1 || echo "Migration warning - continuing startup"' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'npm run start:prod' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Start command
CMD ["/app/start.sh"]
