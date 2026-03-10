# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Genera el Prisma Client y compila TypeScript
RUN npx prisma generate
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copia el Prisma Client generado y el código compilado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Ejecuta migraciones y arranca el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
