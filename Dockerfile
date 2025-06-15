FROM node:20-alpine AS build
WORKDIR /app

# 1. install deps (fast cache)
COPY package*.json ./
RUN npm ci --include=dev

# 2. copy the rest of the source, *including* prisma/
COPY . .

# 3. generate client *now that schema exists*
RUN npx prisma generate

# 4. build NestJS
RUN npm run build

# 5. prune dev deps → small runtime image
RUN npm prune --production

# ---- runtime (optional) ----
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
ENV NODE_ENV=production
CMD ["node","dist/main.js"]
