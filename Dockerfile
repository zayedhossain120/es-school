# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --include=dev

# Copy rest of the app
COPY . .

# Run prisma generate
RUN npx prisma generate

# Then build or start
CMD ["npm", "run", "start"]
