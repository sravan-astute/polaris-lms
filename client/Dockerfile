# client/Dockerfile
FROM node:18-alpine

WORKDIR /app

# 1. Copy dependencies definition
COPY package*.json ./

# 2. Install dependencies
RUN npm install

# 3. Copy the rest of the frontend code
COPY . .

# 4. Build the Next.js app
RUN npm run build

# 5. Start the frontend
EXPOSE 3000
CMD ["npm", "start"]