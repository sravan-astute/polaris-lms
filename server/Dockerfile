# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Build the app
RUN npm run build

# 🔍 DEBUG: Show us exactly where the file is (prints to build logs)
RUN echo " listing dist folder structure:" && ls -R dist

# Expose port
EXPOSE 8080
ENV PORT=8080

# 🚀 SMART START: Check both possible locations for main.js
CMD ["sh", "-c", "if [ -f dist/main.js ]; then node dist/main.js; else node dist/src/main.js; fi"]