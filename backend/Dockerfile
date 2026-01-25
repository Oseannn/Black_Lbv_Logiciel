# Dockerfile for Railway deployment
FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without cache issues
RUN npm ci --cache /tmp/.npm

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
