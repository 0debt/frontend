# Fase 1: Base - Usamos la imagen oficial de Bun
FROM oven/bun:1 AS base

WORKDIR /app

# Fase 2: Instalación de dependencias - Usamos bun install
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --no-save --frozen-lockfile

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

# Crea un usuario y grupo sin privilegios (shadow-utils disponibles en la base)
RUN groupadd -g 1001 nodejs \
 && useradd -u 1001 -g nodejs -m nextjs

# Copia solo los archivos optimizados de la build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambia al usuario sin privilegios
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Ejecuta el servidor standalone con Bun
CMD ["bun", "./server.js"]
