# Mock System Documentation

This document explains the mock system available for local development.

## Overview

The frontend supports multiple independent mock modes, allowing you to simulate different parts of the backend system independently.

| Mode | Environment Variable | Purpose |
|------|---------------------|---------|
| **Auth Mock** | `MOCK_AUTH=true` | Simulates authenticated user |
| **Groups Mock** | `MOCK_GROUPS=true` | Simulates groups data |
| **Expenses Mock** | `MOCK_EXPENSES=true` | Simulates expenses and stats |
| **Budgets Mock** | `MOCK_BUDGETS=true` | Simulates budgets |

All modes can be enabled simultaneously or independently.

---

## MOCK_AUTH

When enabled, simulates a logged-in user without requiring the users-service.

### Enable

```bash
# In .env
MOCK_AUTH=true
```

### Behavior

- Bypasses JWT authentication in middleware
- Uses `MOCK_USER` for user data
- Allows access to protected routes

### Mock User

Defined in `app/lib/mock-data/auth.ts`.

---

## MOCK_GROUPS

When enabled, simulates groups data without requiring the groups-service.

### Enable

```bash
# In .env
MOCK_GROUPS=true
```

### Behavior

- Returns mock groups instead of calling API
- Provides sample groups with members

### Mock Groups

Defined in `app/lib/mock-data/groups.ts`.

---

## MOCK_EXPENSES

When enabled, simulates expenses, balances, and statistics without requiring the expenses-service.

### Enable

```bash
# In .env
MOCK_EXPENSES=true
```

### Behavior

- Returns mock expenses, balances, and stats
- Uses `MOCK_USERS` (mock participants) for member info if groups service is not available

### Mock Data

Defined in `app/lib/mock-data/expenses.ts`.

---

## MOCK_BUDGETS

When enabled, simulates budgets data.

### Enable

```bash
# In .env
MOCK_BUDGETS=true
```

### Behavior

- Returns mock budgets and statuses

### Mock Data

Defined in `app/lib/mock-data/budgets.ts`.

---

## Usage Examples

### Full Mock Mode (Frontend Only)

```bash
# .env
MOCK_AUTH=true
MOCK_GROUPS=true
MOCK_EXPENSES=true
MOCK_BUDGETS=true
```

### Development with users-service only

```bash
# .env
MOCK_AUTH=false
MOCK_GROUPS=true
MOCK_EXPENSES=true
API_GATEWAY_URL=https://api-gateway.0debt.xyz
```

---

## Mock Data Location

All mock data is organized in `app/lib/mock-data/`:

```
app/lib/mock-data/
├── auth.ts      # MOCK_USER, flags
├── groups.ts    # MOCK_GROUPS
├── expenses.ts  # MOCK_EXPENSES, MOCK_BALANCE, MOCK_STATS, MOCK_USERS
└── budgets.ts   # MOCK_BUDGETS
```

---

## Adding New Mock Data

1. Create or update a file in `app/lib/mock-data/`
2. Define the mock data and the flag reading `process.env.MOCK_...`
3. Export from the module
4. Use in helper functions with the specific check

Example:

```typescript
// In app/lib/mock-data/feature.ts
export const isMockFeatureEnabled = process.env.MOCK_FEATURE === "true"
export const MOCK_DATA = [...]

// In your helper
import { isMockFeatureEnabled, MOCK_DATA } from '@/app/lib/mock-data/feature'

async function getData() {
  if (isMockFeatureEnabled) {
    return MOCK_DATA
  }
  // Real API call...
}
```

---

## Notes

- Mock modes are only for development
- Never enable mocks in production
- Mock data is reset on server restart
- Changes to mock data require server restart