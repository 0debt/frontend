# Guía de contribución al Frontend

Este documento explica la arquitectura, estructura y cómo contribuir al proyecto frontend.

## 📋 Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Autenticación](#autenticación)
- [Routing](#routing)
- [Añadir nuevas funcionalidades](#añadir-nuevas-funcionalidades)
- [Componentes UI](#componentes-ui)
- [Tests](#tests)
- [Optimizaciones](#optimizaciones)
- [Comandos](#comandos)

## 🏗️ Arquitectura

Este proyecto utiliza **Next.js 16** con **App Router** (routing basado en archivos).

**Conceptos básicos:**
- `page.tsx` = una ruta/página
- `layout.tsx` = wrapper compartido entre rutas
- `(nombre)` = Route Group (no afecta la URL, solo organiza)
- Server Components por defecto (usa `'use client'` solo si necesitas hooks/eventos)

## 🛠️ Tecnologías

### Core
- **Next.js 16.0.1**: Framework React con App Router
- **React 19.2.0**: Biblioteca UI
- **TypeScript 5**: Tipado estático
- **Bun**: Runtime y package manager

### UI & Estilos
- **Tailwind CSS 4**: Framework CSS utility-first
- **shadcn/ui**: Componentes UI (ubicados en `shadcn/components/ui/`)
- **Radix UI**: Primitivos accesibles (usado por shadcn/ui)
- **Lucide React**: Iconos
- **next-view-transitions**: Transiciones suaves entre páginas

### Desarrollo
- **ESLint**: Linter
- **Bun Test**: Framework de testing

## 📁 Estructura del proyecto

```
frontend/
├── app/                        # App Router (rutas y páginas)
│   ├── (auth)/                 # Route Group - páginas de autenticación
│   │   ├── sign-in/            # /sign-in
│   │   └── sign-up/            # /sign-up
│   ├── (marketing)/            # Route Group
│   │   └── page.tsx            # / (homepage)
│   ├── (users)/                # Route Group - perfil de usuario
│   │   └── me/                 # /me
│   ├── budgets/                # /budgets
│   │   ├── edit/               # /budgets/edit
│   │   ├── new/                # /budgets/new
│   │   └── view/               # /budgets/view
│   ├── expenses/               # /expenses
│   │   ├── new/                # /expenses/new
│   │   └── settle/             # /expenses/settle
│   ├── groups/                 # /groups
│   │   ├── [id]/               # /groups/:id
│   │   │   └── edit/           # /groups/:id/edit
│   │   └── new/                # /groups/new
│   ├── plans/                  # /plans
│   ├── actions/                # Server Actions
│   │   ├── auth.ts             # login, signup, logout
│   │   ├── budgets.ts          # operaciones de budgets
│   │   ├── expenses.ts         # operaciones de expenses
│   │   └── groups.ts           # operaciones de groups
│   ├── api/                    # API Routes (proxy al backend)
│   │   ├── notifications/      # /api/notifications/*
│   │   └── version/            # /api/version
│   ├── components/             # Componentes específicos de la app
│   │   ├── Header.tsx
│   │   ├── MainNav.tsx
│   │   ├── GroupCard.tsx
│   │   ├── ExpenseForm.tsx
│   │   └── ...
│   ├── lib/                    # Lógica de negocio y utilidades
│   │   ├── api.ts              # Cliente API con auth (fetchWithAuth)
│   │   ├── config.ts           # Configuración (API_GATEWAY_URL)
│   │   ├── session.ts          # Manejo de sesión JWT
│   │   ├── users.ts            # Helpers de usuarios
│   │   ├── groups.ts           # Helpers de grupos
│   │   ├── expenses.ts         # Helpers de expenses
│   │   └── mock-data/          # Datos mock para desarrollo
│   │       ├── auth.ts         # MOCK_USER, isMockAuthEnabled
│   │       ├── groups.ts       # MOCK_GROUPS
│   │       ├── expenses.ts     # MOCK_EXPENSES, MOCK_BALANCE, MOCK_STATS
│   │       └── budgets.ts      # MOCK_BUDGETS
│   ├── providers/              # Context Providers
│   │   └── AuthProvider.tsx    # Estado de auth en cliente
│   ├── __tests__/              # Tests
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Estilos globales
│   └── not-found.tsx           # Página 404
├── shadcn/                     # Componentes shadcn/ui
│   └── components/ui/          # Button, Card, Input, etc.
├── lib/                        # Utilidades globales
│   └── utils.ts                # Funciones helper (cn, etc.)
├── public/                     # Archivos estáticos
│   └── fonts/                  # Fuentes locales
├── components.json             # Configuración shadcn/ui
├── next.config.ts              # Configuración Next.js
├── proxy.ts                    # Middleware de protección de rutas
├── package.json
└── tsconfig.json               # Configuración TypeScript
```

## 🔐 Autenticación

El sistema de autenticación usa **JWT** con cookies HttpOnly siguiendo las mejores prácticas de Next.js 16.

### Arquitectura

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Cliente   │ ───► │   Next.js   │ ───► │   Backend   │
│  (Browser)  │      │   Server    │      │ (API Gateway)│
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       │  Cookie HttpOnly   │   Authorization    │
       │  (session)         │   Bearer Token     │
       └────────────────────┴────────────────────┘
```

### Archivos clave

| Archivo | Descripción |
|---------|-------------|
| `app/lib/session.ts` | Manejo de sesión (crear, obtener, eliminar cookie) |
| `app/lib/api.ts` | Cliente API con autenticación automática |
| `app/lib/config.ts` | Configuración centralizada (API_GATEWAY_URL) |
| `app/lib/mock-data/` | Datos mock para desarrollo local |
| `app/actions/auth.ts` | Server Actions: `login`, `signup`, `logout` |
| `proxy.ts` | Middleware para proteger rutas |
| `app/providers/AuthProvider.tsx` | Contexto React para estado de auth en cliente |

### Flujo de autenticación

**1. Sign Up:**
```
Usuario → signup() → POST /auth/register → POST /auth/login → Cookie JWT → Redirect /me
```

**2. Sign In:**
```
Usuario → login() → POST /auth/login → Cookie JWT HttpOnly → Redirect /me
```

**3. Logout:**
```
Usuario → logout() → Eliminar cookie → Redirect /sign-in
```

### Protección de rutas

El archivo `proxy.ts` protege las rutas automáticamente:

```typescript
// Rutas protegidas (requieren autenticación)
const protectedRoutes = ['/me', '/budgets']

// Rutas de auth (redirigen si ya está autenticado)
const authRoutes = ['/sign-in', '/sign-up']
```

- Si un usuario **no autenticado** accede a `/me` → redirige a `/sign-in`
- Si un usuario **autenticado** accede a `/sign-in` → redirige a `/me`

### Usar autenticación en páginas

**Server Components (recomendado):**
```typescript
import { getSession } from '@/app/lib/session'
import { fetchWithAuth } from '@/app/lib/api'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/sign-in')
  }

  // Fetch autenticado al backend
  const res = await fetchWithAuth('/users/me')
  const user = await res.json()

  return <div>Hola {user.name}</div>
}
```

**Client Components:**
```typescript
'use client'
import { useAuth } from '@/app/providers/AuthProvider'

export function UserInfo() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return <span>{user?.email}</span>
}
```

### Configuración

Variables de entorno en `.env`:
```bash
# URL del API Gateway (backend)
API_GATEWAY_URL=http://api-gateway:8000

# Modos mock para desarrollo local (sin backend)
MOCK_AUTH=true
MOCK_GROUPS=true
MOCK_EXPENSES=true
MOCK_BUDGETS=true
```

### Sesión y expiración

- El JWT que devuelve users-service se guarda en la cookie `session` (HttpOnly, SameSite Lax, secure en prod) con una caducidad de ~1 hora.
- `getSession` decodifica el payload y, si `exp` está vencido, elimina la cookie y devuelve `null`.
- No hay refresh token ni “remember me”: pasado el vencimiento, el usuario debe iniciar sesión de nuevo.

### Modo Mock (desarrollo local)

El proyecto soporta **4 modos mock independientes** para desarrollo local sin necesidad de backend:

| Variable | Propósito |
|----------|-----------|
| `MOCK_AUTH=true` | Simula usuario autenticado |
| `MOCK_GROUPS=true` | Simula datos de grupos |
| `MOCK_EXPENSES=true` | Simula expenses, balances y estadísticas |
| `MOCK_BUDGETS=true` | Simula datos de budgets |

Todos los modos pueden habilitarse simultáneamente o de forma independiente.

**Archivos mock:**
```
app/lib/mock-data/
├── auth.ts      # MOCK_USER, isMockAuthEnabled
├── groups.ts    # MOCK_GROUPS, isMockGroupsEnabled
├── expenses.ts  # MOCK_EXPENSES, MOCK_BALANCE, MOCK_STATS
└── budgets.ts   # MOCK_BUDGETS, isMockBudgetsEnabled
```

Para documentación detallada, ver **[MOCK.md](./MOCK.md)**.

**Ejemplos de configuración:**

```bash
# .env - desarrollo sin backend (full mock)
MOCK_AUTH=true
MOCK_GROUPS=true
MOCK_EXPENSES=true
MOCK_BUDGETS=true

# .env - desarrollo con users-service real
MOCK_AUTH=false
MOCK_GROUPS=true
MOCK_EXPENSES=true
MOCK_BUDGETS=true
API_GATEWAY_URL=https://api-gateway.0debt.xyz
```

## 🗺️ Routing

**Regla simple**: La estructura de carpetas = las URLs

```
app/
├── page.tsx              → /
├── about/page.tsx        → /about
├── (auth)/
│   └── sign-in/page.tsx  → /sign-in (el (auth) no aparece en la URL)
└── budgets/
    └── page.tsx          → /budgets
```

**Rutas dinámicas:**
- `[id]/page.tsx` → `/products/123`
- `[...slug]/page.tsx` → `/docs/a/b/c` (catch-all)

## ➕ Añadir nuevas funcionalidades

### Añadir una nueva página/ruta

1. **Crear carpeta + `page.tsx`**:

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1>About Us</h1>
    </main>
  )
}
```

Listo, ya tienes `/about` funcionando.

2. **Añadir al menú** (opcional):

```typescript
// app/components/MainNav.tsx
const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' }, // ← Añadir
  // ...
]
```

### Añadir layout compartido

```typescript
// app/settings/layout.tsx
export default function SettingsLayout({ children }) {
  return (
    <div>
      <nav>Settings Nav</nav>
      {children}
    </div>
  )
}
```

### Ruta dinámica

```typescript
// app/products/[id]/page.tsx
type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  return <div>Product {id}</div>
}
```

### Llamadas a servicios (Gateway / Kong)

- Usa siempre `fetchWithAuth` (`app/lib/api.ts`) desde Server Components / API routes; añade el token automáticamente.
- En Client Components, no llames directo al gateway: crea una ruta interna en `app/api/*` que proxye con `fetchWithAuth` y consume esa ruta desde el cliente.
- Notificaciones: la campana usa `/api/notifications/:userId` (ruta interna) para que el servidor adjunte JWT. Evita usar `API_GATEWAY_URL` directo en el navegador.
- Configuración central de URLs en `app/lib/config.ts` (`API_GATEWAY_URL` única fuente; `NEXT_PUBLIC_` solo para exponer la URL, no secretos).

## 🎨 Componentes UI

### shadcn/ui

Los componentes UI están en `shadcn/components/ui/`. Para añadir nuevos:

```bash
bunx shadcn@latest add [component-name] --yes
```
Página: https://ui.shadcn.com/docs/components

**Componentes disponibles actualmente:**
- `Button`
- `Card`
- `Input`
- `Label`
- `ScrollArea`
- `Skeleton`
- `Sonner` (toast notifications)

### Usar componentes shadcn/ui

```typescript
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/shadcn/components/ui/card'

export default function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <Button>Click me</Button>
    </Card>
    </Card>
  )
}
```

### Crear componentes propios

Los componentes específicos de la app van en `app/components/`:

```typescript
// app/components/MyComponent.tsx
'use client' // Solo si necesitas hooks o interactividad

export function MyComponent() {
  return <div>My Component</div>
}
```

## 🧪 Tests

**Ejecutar:**
```bash
bun test
```

**No necesitas el servidor corriendo** - son tests unitarios básicos.

**Añadir tests:**
```typescript
// app/__tests__/my-feature.spec.tsx
import { describe, expect, it } from 'bun:test'

describe('My Feature', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })
})
```

## ⚡ Optimizaciones aplicadas

- **Fuentes locales** en `public/fonts/` (más rápido que Google Fonts)
- **`output: 'standalone'`** solo en producción (desarrollo más rápido)
- **Server Components** por defecto (usa `'use client'` solo si necesitas hooks/eventos)
- **View Transitions** para navegación fluida entre páginas

## 🚀 Comandos

```bash
# Desarrollo
bun dev              # Inicia servidor de desarrollo (localhost:3000)

# Build
bun build            # Build para producción
bun start            # Inicia servidor de producción

# Testing
bun test             # Ejecuta tests

# Linting
bun lint             # Ejecuta ESLint
```

## 🔧 Configuraciones

**TypeScript paths:** `@/` apunta a la raíz del proyecto
```typescript
import { Button } from '@/shadcn/components/ui/button'
import { cn } from '@/lib/utils'
```

**shadcn/ui:** Componentes en `shadcn/components/ui/` (config en `components.json`)

## 🎬 View Transitions

El proyecto utiliza **View Transitions** para transiciones suaves entre páginas.

**Importante**: Usa `Link` de `next-view-transitions` en lugar de `next/link`:

```typescript
// ✅ Correcto
import { Link } from 'next-view-transitions'

// ❌ Incorrecto
import Link from 'next/link'
```

**Configuración:**
- `ViewTransitions` envuelve la app en `app/layout.tsx`
- Las animaciones están configuradas en `app/globals.css`
- Duración: 0.25s con fade in/out suave

## 📝 Buenas prácticas

- **Server Components primero** (usa `'use client'` solo si necesitas hooks/eventos)
- **shadcn/ui** para componentes (no crear desde cero)
- **TypeScript** en todo
- **`next/image`** para imágenes
- **`Link` de `next-view-transitions`** para navegación (NO `next/link`)

## 📚 Recursos

- [Next.js 16 Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Bun Docs](https://bun.sh/docs)

---
