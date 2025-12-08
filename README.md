<div align="center">

# 0debt frontend

**The web experience for splitting expenses and settling debts with friends.**

[![Bun](https://img.shields.io/badge/Bun-black?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-111827?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## ⚡ Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun build && bun start
```

---

## 🏗️ Stack

| Layer | Tech |
|-------|------|
| **Runtime** | Bun |
| **Framework** | Next.js 16 (App Router) + React 19 |
| **UI Components** | Shadcn UI + Radix Primitives |
| **Styling** | TailwindCSS |
| **Auth** | JWT (HttpOnly cookies) |
| **API** | Kong API Gateway |

---

## 📁 Project Structure

```
app/
├── (auth)/          # Auth pages (sign-in, sign-up)
├── api/             # Internal API routes (proxy to gateway)
├── components/      # Shared UI components
├── lib/             # Utils, config, API clients
├── budgets/         # Budget management pages
├── groups/          # Group management pages
└── me/              # User profile
```

---

## 🔌 API Architecture

All API calls are routed through Kong API Gateway. The frontend never calls microservices directly.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client (UI)   │ ──► │  Next.js API     │ ──► │  Kong Gateway   │
│                 │     │  (JWT injection) │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

- **Server Components / Actions**: Use `fetchWithAuth()` directly
- **Client Components**: Call internal `/api/*` routes that proxy to Kong with JWT attached

---

## 🔧 Environment

| Variable | Description |
|----------|-------------|
| `API_GATEWAY_URL` | Gateway URL (auto-exposed as `NEXT_PUBLIC_API_GATEWAY_URL`) |

Default: `http://api-gateway:8000`

---

## 📖 Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidelines on adding features, API conventions, and code style.

---

<div align="center">

**Apache License 2.0**

</div>
