'use server'

import { fetchWithAuth } from '@/app/lib/api'
import { redirect } from 'next/navigation'

export type ExpenseActionState = {
  error?: string
  success?: boolean
} | null

/**
 * Server Action to create a new expense
 * @param prevState - Previous form state
 * @param formData - Form data containing expense details
 * @returns Error state or redirects to expenses list on success
 */
export async function createExpense(
  prevState: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const groupId = formData.get('groupId') as string
  const description = formData.get('description') as string
  const totalAmount = formData.get('totalAmount') as string
  const currency = formData.get('currency') as string || 'EUR'
  const category = formData.get('category') as string || 'OTHER'
  const splitType = formData.get('splitType') as string || 'EQUAL'
  const payerId = formData.get('payerId') as string
  const participantsRaw = formData.get('participants') as string

  // Validaciones básicas
  if (!groupId || !description || !totalAmount || !payerId) {
    return { error: 'Group, description, amount, and payer are required' }
  }

  const totalAmountNum = parseFloat(totalAmount.replace(',', '.'))
  if (isNaN(totalAmountNum) || totalAmountNum <= 0) {
    return { error: 'Amount must be a positive number' }
  }

  // Parsear participantes (viene como JSON string)
  let participants: string[] = []
  try {
    participants = participantsRaw ? JSON.parse(participantsRaw) : []
  } catch {
    return { error: 'Invalid participants format' }
  }

  if (participants.length === 0) {
    return { error: 'At least one participant is required' }
  }

  // Calcular shares según el tipo de split
  let shares: { userId: string; amount: number }[] = []
  
  if (splitType === 'EQUAL') {
    const shareAmount = Math.round((totalAmountNum / participants.length) * 100) / 100
    shares = participants.map(userId => ({
      userId,
      amount: shareAmount
    }))
  } else if (splitType === 'EXACT') {
    // Para EXACT, los montos vienen en el formData como share_[userId]
    shares = participants.map(userId => {
      const shareAmount = parseFloat((formData.get(`share_${userId}`) as string || '0').replace(',', '.'))
      return { userId, amount: shareAmount }
    })
    
    // Verificar que la suma de shares sea igual al total
    const totalShares = shares.reduce((sum, s) => sum + s.amount, 0)
    if (Math.abs(totalShares - totalAmountNum) > 0.01) {
      return { error: `Share amounts (${totalShares.toFixed(2)}) must equal total (${totalAmountNum.toFixed(2)})` }
    }
  } else if (splitType === 'PERCENTAGE') {
    // Para PERCENTAGE, los porcentajes vienen como percent_[userId]
    shares = participants.map(userId => {
      const percentage = parseFloat((formData.get(`percent_${userId}`) as string || '0').replace(',', '.'))
      const amount = Math.round((totalAmountNum * percentage / 100) * 100) / 100
      return { userId, amount }
    })
  }

  try {
    const body = {
      groupId,
      description: description.trim(),
      totalAmount: totalAmountNum,
      currency,
      category,
      splitType,
      payerId,
      shares,
      date: new Date().toISOString()
    }

    const res = await fetchWithAuth('/api/v1/expenses', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.message || 'Failed to create expense' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  redirect(`/expenses/${groupId}`)
}

/**
 * Server Action to delete an expense
 * @param expenseId - Expense ID
 * @param groupId - Group ID for redirect
 * @returns Error state or redirects to expenses list on success
 */
export async function deleteExpense(
  expenseId: string,
  groupId: string
): Promise<ExpenseActionState> {
  try {
    const res = await fetchWithAuth(`/api/v1/expenses/${expenseId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.message || 'Failed to delete expense' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  redirect(`/expenses/${groupId}`)
}