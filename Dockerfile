# Fase 1: Base - Usamos la imagen oficial de Bun
FROM oven/bun:1-alpine AS base
# Instala compatibilidad para dependencias nativas (buena práctica)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Fase 2: Instalación de dependencias - Usamos bun install
FROM base AS deps
COPY package.json bun.lockb* package-lock.json* ./
RUN bun install --frozen-lockfile

# Fase 3: Build de la aplicación - Usamos bun run build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Fase 4: Ejecución en producción con Bun
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crea un usuario y grupo sin privilegios
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia solo los archivos optimizados de la build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambia al usuario sin privilegios
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Ejecuta el servidor optimizado de Next.js usando el script "start" de package.json
CMD ["bun", "start"]
