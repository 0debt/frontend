/**
 * Types and helper functions for expenses module
 */

import { getDefaultAvatar } from '@/lib/utils'

// ============ TYPES ============ 
export type ExpenseCategory = 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'ENTERTAINMENT' | 'OTHER'

export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE'

export type ExpenseShare = {
  userId: string
  amount: number
}

export type Expense = {
  _id: string
  description: string
  totalAmount: number
  originalAmount: number
  currency: string
  exchangeRate: number
  date: string
  payerId: string
  groupId: string
  splitType: SplitType
  category: ExpenseCategory
  shares: ExpenseShare[]
  createdAt: string
  updatedAt?: string
  isSettlement?: boolean
}

export type BalanceMap = {
  [userId: string]: number
}

export type PaymentInstruction = {
  from: string
  to: string
  amount: number
}

export type BalanceResponse = {
  balances: BalanceMap
  payments: PaymentInstruction[]
}

export type GroupStats = {
  totalSpent: number
  count: number
  byCategory: Record<string, number>
  lastUpdated?: string
}

// Mock user mapping for display (en producción vendría del users-service)
export type UserInfo = {
  _id: string
  name: string
  avatar?: string
}

// ============ HELPER FUNCTIONS ============

export function getCategoryIcon(category: ExpenseCategory): string {
  const icons: Record<ExpenseCategory, string> = {
    'FOOD': '🍔',
    'TRANSPORT': '🚗',
    'ACCOMMODATION': '🏨',
    'ENTERTAINMENT': '🎬',
    'OTHER': '📦'
  }
  return icons[category] || '📦'
}

export function getCategoryLabel(category: ExpenseCategory): string {
  const labels: Record<ExpenseCategory, string> = {
    'FOOD': 'Food & Drinks',
    'TRANSPORT': 'Transport',
    'ACCOMMODATION': 'Accommodation',
    'ENTERTAINMENT': 'Entertainment',
    'OTHER': 'Other'
  }
  return labels[category] || 'Other'
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export function getUserName(userId: string, users: UserInfo[]): string {
  const user = users.find(u => u._id === userId)
  return user?.name || userId
}

export function getUserAvatar(userId: string, users: UserInfo[]): string {
  const user = users.find(u => u._id === userId)
  return user?.avatar || getDefaultAvatar(userId)
}

export function isSettlementExpense(expense: Expense): boolean {
  return expense.isSettlement === true
}

// Re-export helpers
