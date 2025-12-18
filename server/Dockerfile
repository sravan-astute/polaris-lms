# server/Dockerfile
FROM node:18-alpine

# 1. FIX: Install OpenSSL (Required for Prisma on Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma folder
COPY prisma ./prisma/

# Generate Prisma Client (Re-builds the engine for Alpine)
RUN npx prisma generate

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 8080
ENV PORT=8080

# Start the app (using the smart check)
CMD ["sh", "-c", "if [ -f dist/main.js ]; then node dist/main.js; else node dist/src/main.js; fi"]