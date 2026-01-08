'use server'

import { fetchWithAuth } from '@/app/lib/api'
import { isMockExpensesEnabled } from '@/app/lib/mock-data/expenses'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ExpenseActionState = {
  error?: string
  success?: boolean
} | null

function calculateShares(
  splitType: string,
  totalAmountNum: number,
  participants: string[],
  formData: FormData
) {
  let shares: { userId: string; amount: number }[] = []

  if (splitType === 'EQUAL') {
    const shareAmount = Math.round((totalAmountNum / participants.length) * 100) / 100
    // Distribuir el resto de decimales podría ser necesario, pero por ahora simplificado
    shares = participants.map(userId => ({
      userId,
      amount: shareAmount
    }))
  } else if (splitType === 'EXACT') {
    shares = participants.map(userId => {
      const rawVal = formData.get(`share_${userId}`) as string || '0'
      const shareAmount = parseFloat(rawVal.replace(/\./g, '').replace(',', '.'))
      return { userId, amount: shareAmount }
    })
    
    const totalShares = shares.reduce((sum, s) => sum + s.amount, 0)
    if (Math.abs(totalShares - totalAmountNum) > 0.01) {
      throw new Error(`Total shares (${totalShares.toFixed(2)}) must equal total amount (${totalAmountNum.toFixed(2)})`)
    }
  } else if (splitType === 'PERCENTAGE') {
    shares = participants.map(userId => {
      const rawVal = formData.get(`percent_${userId}`) as string || '0'
      const percentage = parseFloat(rawVal.replace(/\./g, '').replace(',', '.'))
      const amount = Math.round((totalAmountNum * percentage / 100) * 100) / 100
      return { userId, amount }
    })
  }
  return shares
}

/**
 * Server Action to create a new expense
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

  if (!groupId || !description || !totalAmount || !payerId) {
    return { error: 'Group, description, amount, and payer are required' }
  }

  const totalAmountNum = parseFloat(totalAmount.replace(/\./g, '').replace(',', '.'))
  if (isNaN(totalAmountNum) || totalAmountNum <= 0) {
    return { error: 'Amount must be a positive number' }
  }

  let participants: string[] = []
  try {
    participants = participantsRaw ? JSON.parse(participantsRaw) : []
  } catch {
    return { error: 'Invalid participants format' }
  }

  if (participants.length === 0) {
    return { error: 'At least one participant is required' }
  }

  if (isMockExpensesEnabled) {
    redirect(`/expenses?group=${groupId}`)
  }

  let shares
  try {
    shares = calculateShares(splitType, totalAmountNum, participants, formData)
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Calculation error'
    return { error: errorMessage }
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

    const res = await fetchWithAuth('/expenses', {
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

  revalidatePath(`/expenses`)
  redirect(`/expenses?group=${groupId}`)
}

/**
 * Server Action to update an existing expense
 */
export async function updateExpense(
  expenseId: string,
  groupId: string,
  prevState: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const description = formData.get('description') as string
  const totalAmount = formData.get('totalAmount') as string
  const currency = formData.get('currency') as string || 'EUR'
  const category = formData.get('category') as string || 'OTHER'
  const splitType = formData.get('splitType') as string || 'EQUAL'
  const payerId = formData.get('payerId') as string
  const participantsRaw = formData.get('participants') as string

  if (!expenseId || !description || !totalAmount || !payerId) {
    return { error: 'Missing required fields' }
  }

  const totalAmountNum = parseFloat(totalAmount.replace(/\./g, '').replace(',', '.'))
  if (isNaN(totalAmountNum) || totalAmountNum <= 0) {
    return { error: 'Amount must be a positive number' }
  }

  let participants: string[] = []
  try {
    participants = participantsRaw ? JSON.parse(participantsRaw) : []
  } catch {
    return { error: 'Invalid participants format' }
  }

  if (isMockExpensesEnabled) {
    revalidatePath(`/expenses`)
    redirect(`/expenses?group=${groupId}`)
  }

  let shares
  try {
    shares = calculateShares(splitType, totalAmountNum, participants, formData)
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Calculation error'
    return { error: errorMessage }
  }

  try {
    const body = {
      groupId, // Optional for update but good for validation
      description: description.trim(),
      totalAmount: totalAmountNum,
      currency,
      category,
      payerId,
      shares,
      // Date update logic could be added if we had a date picker
    }

    const res = await fetchWithAuth(`/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.message || 'Failed to update expense' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  revalidatePath(`/expenses`)
  redirect(`/expenses?group=${groupId}`)
}

export async function deleteExpense(
  expenseId: string,
  groupId: string
): Promise<ExpenseActionState> {
  if (isMockExpensesEnabled) {
    revalidatePath(`/expenses`)
    redirect(`/expenses?group=${groupId}`)
  }

  try {
    const res = await fetchWithAuth(`/expenses/${expenseId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.message || 'Failed to delete expense' }
    }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }

  revalidatePath(`/expenses`)
  redirect(`/expenses?group=${groupId}`)
}

/**
 * Server Action to create a settlement (mark debt as paid)
 */
export async function createSettlement(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  amount: number
): Promise<ExpenseActionState> {
  if (isMockExpensesEnabled) {
    revalidatePath(`/expenses/settle`)
    return { success: true }
  }

  try {
    const body = {
      groupId,
      fromUserId,
      toUserId,
      amount
    }

    const res = await fetchWithAuth('/settlements', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      return { error: data.message || 'Failed to record settlement' }
    }
    
    revalidatePath(`/expenses/settle`)
    revalidatePath(`/expenses`)
    return { success: true }
  } catch {
    return { error: 'Connection error. Please try again.' }
  }
}
