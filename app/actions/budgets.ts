'use server'

import { fetchWithAuth } from '@/app/lib/api'
import { redirect } from 'next/navigation'

export type BudgetActionState = {
  error?: string
  success?: boolean
} | null

/**
 * Server Action to create a new budget
 * @param prevState - Previous form state
 * @param formData - Form data containing groupId, category, limitAmount, period
 * @returns Error state or redirects to /budgets on success
 */
export async function createBudget(
  prevState: BudgetActionState,
  formData: FormData
): Promise<BudgetActionState> {
  const groupId = formData.get('groupId') as string || 'demo-group'
  const category = formData.get('category') as string
  const limitAmount = formData.get('limitAmount') as string
  const period = formData.get('period') as string

  if (!limitAmount) {
    return { error: 'Limit amount is required' }
  }

  // Remove everything except numbers and the decimal comma, then convert to dot
  const limitAmountNum = parseFloat(limitAmount.replace(/[^\d,]/g, '').replace(',', '.'))
  if (isNaN(limitAmountNum) || limitAmountNum <= 0) {
    return { error: 'Limit amount must be a positive number' }
  }

  try {
    const body: Record<string, unknown> = {
      groupId,
      limitAmount: limitAmountNum,
      period,
    }

    if (category && category.trim()) {
      body.category = category.trim()
    }

    const res = await fetchWithAuth('/v1/budgets', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Failed to create budget' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  redirect('/budgets')
}

/**
 * Server Action to update a budget
 * @param id - Budget ID
 * @param prevState - Previous form state
 * @param formData - Form data containing limitAmount
 * @returns Error state or redirects to /budgets/:id on success
 */
export async function updateBudget(
  id: string,
  prevState: BudgetActionState,
  formData: FormData
): Promise<BudgetActionState> {
  const limitAmount = formData.get('limitAmount') as string
  const groupId = formData.get('groupId') as string

  if (!limitAmount) {
    return { error: 'Limit amount is required' }
  }

  // Remove everything except numbers and the decimal comma, then convert to dot
  const limitAmountNum = parseFloat(limitAmount.replace(/[^\d,]/g, '').replace(',', '.'))
  if (isNaN(limitAmountNum) || limitAmountNum <= 0) {
    return { error: 'Limit amount must be a positive number' }
  }

  try {
    const res = await fetchWithAuth(`/v1/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ limitAmount: limitAmountNum }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Failed to update budget' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  if (groupId) {
    redirect(`/budgets/view?budgetId=${id}&groupId=${groupId}`)
  } else {
    redirect('/budgets')
  }
}

/**
 * Server Action to delete a budget
 * @param id - Budget ID
 * @returns Error state or redirects to /budgets on success
 */
export async function deleteBudget(id: string): Promise<BudgetActionState> {
  try {
    const res = await fetchWithAuth(`/v1/budgets/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.error || 'Failed to delete budget' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  redirect('/budgets')
}

