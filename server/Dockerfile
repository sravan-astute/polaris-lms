# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

# 1. Copy dependencies definition
COPY package*.json ./

# 2. Install dependencies
RUN npm install

# 3. Copy Prisma schema and generate client (Crucial for DB)
COPY prisma ./prisma/
RUN npx prisma generate

# 4. Copy the rest of the backend code
COPY . .

# 5. Build the NestJS app
RUN npm run build

# 6. Expose the port (Cloud Run uses 8080 by default)
EXPOSE 8080
ENV PORT=8080

# 7. Start the server
CMD ["node", "dist/main"]