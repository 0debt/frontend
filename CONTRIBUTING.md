# Guía de contribución al Frontend

Este documento explica la arquitectura, estructura y cómo contribuir al proyecto frontend.

## 📋 Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
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

### Desarrollo
- **ESLint**: Linter
- **Bun Test**: Framework de testing

## 📁 Estructura del proyecto

```
frontend/
├── app/                    # App Router (rutas y páginas)
│   ├── (auth)/            # Route Group - no afecta la URL
│   │   └── sign-in/       # /sign-in
│   ├── (marketing)/       # Route Group
│   │   └── page.tsx       # / (homepage)
│   ├── dashboard/         # /dashboard
│   │   ├── (analytics)/   # Route Group
│   │   │   └── page.tsx   # /dashboard (renderiza analytics)
│   │   └── layout.tsx     # Layout para /dashboard/*
│   ├── docs/              # /docs
│   │   └── page.tsx
│   ├── components/        # Componentes específicos de la app
│   │   ├── Header.tsx
│   │   └── MainNav.tsx
│   ├── __tests__/         # Tests
│   ├── layout.tsx         # Root layout (envolvente de toda la app)
│   └── globals.css        # Estilos globales
├── shadcn/                # Componentes shadcn/ui
│   └── components/
│       └── ui/            # Componentes UI reutilizables
├── lib/                   # Utilidades
│   └── utils.ts           # Funciones helper (cn, etc.)
├── public/                # Archivos estáticos
│   ├── fonts/             # Fuentes locales
│   └── 0debt-logo.svg
├── components.json         # Configuración shadcn/ui
├── next.config.ts         # Configuración Next.js
├── package.json
└── tsconfig.json          # Configuración TypeScript
```

## 🗺️ Routing

**Regla simple**: La estructura de carpetas = las URLs

```
app/
├── page.tsx              → /
├── about/page.tsx        → /about
├── (auth)/
│   └── sign-in/page.tsx  → /sign-in (el (auth) no aparece en la URL)
└── dashboard/
    └── page.tsx          → /dashboard
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

## 📝 Buenas prácticas

- **Server Components primero** (usa `'use client'` solo si necesitas hooks/eventos)
- **shadcn/ui** para componentes (no crear desde cero)
- **TypeScript** en todo
- **`next/image`** para imágenes, **`next/link`** para navegación

## 📚 Recursos

- [Next.js 16 Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Bun Docs](https://bun.sh/docs)

---
