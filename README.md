<div align="center">

# 0debt frontend

**The web experience for splitting expenses and settling debts with friends.**

[![Bun](https://img.shields.io/badge/Bun-black?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-111827?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 🚀 Quick Start

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
| **Data Fetching** | Server Actions + `fetchWithAuth` |
| **UI Components** | Shadcn UI + Radix Primitives |
| **Styling** | TailwindCSS |
| **Auth** | JWT (HttpOnly cookies) |
| **API** | Kong API Gateway |

---

## 📁 Project Structure

```
app/
├── (auth)/          # Authentication pages (sign-in, sign-up)
├── (users)/         # User profile pages (/me)
├── actions/         # Server Actions (Backend mutations & logic)
├── budgets/         # Budget management modules
├── components/      # Shared application components
├── expenses/        # Expense tracking & settling
├── groups/          # Group management & details
├── lib/
│   ├── api.ts       # Secure API client
│   ├── mock-data/   # Offline development data
│   └── session.ts   # Cookie session management
└── providers/       # Context providers (Auth, Theme)

shadcn/              # UI Component Library (Buttons, Dialogs, etc.)
```

---

## 🔌 API Architecture

All backend interactions are secured and routed through Server Actions, acting as a secure bridge to the Kong API Gateway.

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Client (UI)   │ ──► │ Next.js Server Action│ ──► │  Kong Gateway   │
│ (Interactivity) │     │ (Auth & Validation)  │     │ (Microservices) │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

- **Server Components**: Call `fetchWithAuth()` directly to render data on the server.
- **Client Components**: Trigger **Server Actions** (`app/actions/*.ts`) to perform mutations (Create, Update, Delete). We avoid exposing direct API proxy routes to the client.

---

## 🔧 Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `API_GATEWAY_URL` | Gateway URL (e.g., `http://api-gateway:8000`) | Required |
| `MOCK_AUTH` | Enable Mock Auth | `false` |
| `MOCK_GROUPS` | Enable Mock Groups Data | `false` |
| `MOCK_EXPENSES` | Enable Mock Expenses Data | `false` |
| `MOCK_BUDGETS` | Enable Mock Budgets Data | `false` |

To enable mock mode for offline development, set the specific flags to `true` in your `.env` file.

---

## 📖 Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidelines on adding features, API conventions, and code style.

---

<div align="center">

**Apache License 2.0**

</div>