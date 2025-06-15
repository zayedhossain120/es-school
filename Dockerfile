FROM node:20

WORKDIR /app

# 1️⃣ Install deps first (include dev deps so prisma CLI is there)
COPY package*.json ./
RUN npm ci --include=dev       # or: RUN npm install

# 2️⃣ Generate the client (uses the CLI we just installed)
RUN npx prisma generate

# 3️⃣ Copy source and build
COPY . .
RUN npm run build

# Optional: strip dev deps from the final layer
RUN npm prune --production

CMD ["node","dist/main.js"]
