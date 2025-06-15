FROM node:20-alpine AS build

WORKDIR /app

# 1️⃣ install all deps (dev + prod)
COPY package*.json ./
RUN npm ci --include=dev            # dev deps stay, so prisma CLI is available

# 2️⃣ copy source only AFTER deps (better cache)
COPY . .

# 3️⃣ generate prisma client
RUN npx prisma generate

# 4️⃣ compile NestJS
RUN npm run build

# 5️⃣ (optional) strip dev deps for runtime image
RUN npm prune --production


# ---- runtime stage (smaller image) ----
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
