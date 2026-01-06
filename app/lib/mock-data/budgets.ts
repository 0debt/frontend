export const isMockBudgetsEnabled = process.env.MOCK_BUDGETS === "true"

export type Budget = {
  _id: string
  groupId: string
  userId: string
  category?: string
  limitAmount: number
  period: string
  createdAt: string
  updatedAt?: string
}

export type BudgetStatus = {
  limit: number
  spent: number
  health: 'OK' | 'WARNING' | 'OVERBUDGET'
}

export const MOCK_BUDGETS: Budget[] = [
  { 
    _id: "1", 
    groupId: "demo-group", 
    userId: "mock-id", 
    category: "Food", 
    limitAmount: 500, 
    period: "monthly", 
    createdAt: "2024-01-01T00:00:00.000Z" 
  },
  { 
    _id: "2", 
    groupId: "demo-group", 
    userId: "mock-id", 
    category: "Transport", 
    limitAmount: 200, 
    period: "monthly", 
    createdAt: "2024-01-01T00:00:00.000Z" 
  },
]

export const MOCK_BUDGET_STATUSES: Record<string, BudgetStatus> = {
  "1": { limit: 500, spent: 350, health: "WARNING" },
  "2": { limit: 200, spent: 150, health: "OK" },
}
