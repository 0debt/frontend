'use client'

import { createExpense, deleteExpense, ExpenseActionState, updateExpense } from '@/app/actions/expenses'
import { NumberInput } from '@/app/components/NumberInput'
import {
  Expense,
  ExpenseCategory,
  formatCurrency,
  getUserAvatar,
  SplitType,
  UserInfo,
} from '@/app/lib/expenses'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shadcn/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar'
import { Badge } from '@/shadcn/components/ui/badge'
import { Button } from '@/shadcn/components/ui/button'
import { Input } from '@/shadcn/components/ui/input'
import { Label } from '@/shadcn/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn/components/ui/select'
import { AlertCircle, Check, Trash2 } from 'lucide-react'
import { useActionState, useEffect, useState } from 'react'

type ExpenseFormProps = {
  groupId: string
  members: UserInfo[]
  currentUserId: string
  initialData?: Expense
  onSuccess?: () => void
}

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'FOOD', label: 'Food & Drinks', icon: '🍔' },
  { value: 'TRANSPORT', label: 'Transport', icon: '🚗' },
  { value: 'ACCOMMODATION', label: 'Accommodation', icon: '🏨' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎬' },
  { value: 'OTHER', label: 'Other', icon: '📦' },
]

const CURRENCIES = [
  { value: 'EUR', label: '€ EUR', symbol: '€' },
  { value: 'USD', label: '$ USD', symbol: '$' },
  { value: 'GBP', label: '£ GBP', symbol: '£' },
  { value: 'JPY', label: '¥ JPY', symbol: '¥' },
]

const SPLIT_TYPES: { value: SplitType; label: string; description: string }[] = [
  { value: 'EQUAL', label: 'Split Equally', description: 'Everyone pays the same' },
  { value: 'EXACT', label: 'Exact Amounts', description: 'Specify each amount' },
  { value: 'PERCENTAGE', label: 'By Percentage', description: 'Split by percentages' },
]

export function ExpenseForm({ groupId, members, currentUserId, initialData, onSuccess }: ExpenseFormProps) {
  // Helper function to normalize decimal format (comma to dot)
  const normalizeNumber = (value: string | number | undefined): number => {
    if (value === undefined || value === '') return 0
    if (typeof value === 'number') return value
    return parseFloat(value.replace(/\./g, '').replace(',', '.'))
  }

  // Bind update action if initialData exists
  const updateAction = initialData
    ? (prevState: ExpenseActionState, formData: FormData) =>
        updateExpense(initialData._id, groupId, prevState, formData)
    : createExpense

  const [state, formAction, isPending] = useActionState<ExpenseActionState, FormData>(
    updateAction,
    null
  )

  const [payerId, setPayerId] = useState(initialData?.payerId || currentUserId)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initialData ? initialData.shares.map(s => s.userId) : members.map(m => m._id)
  )
  const [splitType, setSplitType] = useState<SplitType>(initialData?.splitType || 'EQUAL')
  const [totalAmount, setTotalAmount] = useState<number | undefined>(initialData?.totalAmount)
  const [currency, setCurrency] = useState(initialData?.currency || 'EUR')
  const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || 'OTHER')
  
  // Initialize exactAmounts from initialData if EXACT split type
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(() => {
    if (initialData?.splitType === 'EXACT' && initialData.shares) {
      const exacts: Record<string, string> = {}
      initialData.shares.forEach(s => {
        exacts[s.userId] = s.amount.toString()
      })
      return exacts
    }
    return {}
  })
  
  // Initialize percentages from initialData if PERCENTAGE split type
  const [percentages, setPercentages] = useState<Record<string, string>>(() => {
    if (initialData?.splitType === 'PERCENTAGE' && initialData.shares) {
      const pcts: Record<string, string> = {}
      const total = initialData.totalAmount
      initialData.shares.forEach(s => {
        const pct = (s.amount / total) * 100
        pcts[s.userId] = Math.round(pct).toString()
      })
      return pcts
    }
    return {}
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess()
    }
  }, [state, onSuccess])

  const handleDelete = async () => {
    if (!initialData) return

    await deleteExpense(initialData._id, groupId)
    setShowDeleteDialog(false)
    if (onSuccess) onSuccess()
  }

  // Calcular el share igual
  const equalShare = selectedParticipants.length > 0 && totalAmount
    ? totalAmount / selectedParticipants.length
    : 0

  // Calcular total de exact amounts
  const totalExact = Object.entries(exactAmounts)
    .filter(([userId]) => selectedParticipants.includes(userId))
    .reduce((sum, [, amount]) => sum + (normalizeNumber(amount || '0')), 0)

  // Calcular total de porcentajes
  const totalPercentage = Object.entries(percentages)
    .filter(([userId]) => selectedParticipants.includes(userId))
    .reduce((sum, [, pct]) => sum + (normalizeNumber(pct || '0')), 0)

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Validate form before submit
  const isFormValid = () => {
    if (selectedParticipants.length === 0) return false
    if (!totalAmount) return false

    if (splitType === 'EXACT') {
      return Math.abs(totalExact - totalAmount) < 0.01
    }

    if (splitType === 'PERCENTAGE') {
      return Math.abs(totalPercentage - 100) < 0.01
    }

    return true
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields */}
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="payerId" value={payerId} />
      <input type="hidden" name="splitType" value={splitType} />
      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="participants" value={JSON.stringify(selectedParticipants)} />

      {/* Error message */}
      {state?.error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="What was this expense for?"
          defaultValue={initialData?.description}
          required
          disabled={isPending}
        />
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="totalAmount">Amount</Label>
          <NumberInput
            id="totalAmount"
            name="totalAmount"
            allowNegative={false}
            decimalSeparator=","
            thousandSeparator="."
            decimalScale={2}
            fixedDecimalScale
            min={0.01}
            placeholder="0,00"
            required
            disabled={isPending}
            value={totalAmount}
            onValueChange={(value) => setTotalAmount(value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency} disabled={isPending}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(curr => (
                <SelectItem key={curr.value} value={curr.value}>
                  {curr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select name="category" value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)} disabled={isPending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Who paid */}
      <div className="space-y-2">
        <Label>Who paid?</Label>
        <div className="grid grid-cols-2 gap-2">
          {members.map(member => (
            <button
              key={member._id}
              type="button"
              onClick={() => setPayerId(member._id)}
              disabled={isPending}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                payerId === member._id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-accent'
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={getUserAvatar(member._id, members)} alt={member.name} />
                <AvatarFallback>{member.name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{member.name}</span>
              {payerId === member._id && (
                <Check className="h-4 w-4 text-primary ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Split Type */}
      <div className="space-y-2">
        <Label>How to split?</Label>
        <div className="grid gap-2">
          {SPLIT_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSplitType(type.value)}
              disabled={isPending}
              className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                splitType === type.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-accent'
              }`}
            >
              <div>
                <p className="font-medium">{type.label}</p>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
              {splitType === type.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-2">
        <Label>Split between</Label>
        <div className="space-y-2">
          {members.map(member => {
            const isSelected = selectedParticipants.includes(member._id)
            
            return (
              <div
                key={member._id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isSelected ? 'border-primary/50 bg-primary/5' : 'border-border'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleParticipant(member._id)}
                  disabled={isPending}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getUserAvatar(member._id, members)} alt={member.name} />
                    <AvatarFallback>{member.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{member.name}</span>
                </button>

                {/* Show share input based on split type */}
                {isSelected && splitType === 'EQUAL' && totalAmount && (
                  <Badge variant="secondary">
                    {formatCurrency(equalShare)}
                  </Badge>
                )}

                {isSelected && splitType === 'EXACT' && (
                  <div className="w-28">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      name={`share_${member._id}`}
                      value={exactAmounts[member._id] || ''}
                      onChange={(e) => setExactAmounts(prev => ({
                        ...prev,
                        [member._id]: e.target.value
                      }))}
                      disabled={isPending}
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                {isSelected && splitType === 'PERCENTAGE' && (
                  <div className="flex items-center gap-1 w-24">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="0"
                      name={`percent_${member._id}`}
                      value={percentages[member._id] || ''}
                      onChange={(e) => setPercentages(prev => ({
                        ...prev,
                        [member._id]: e.target.value
                      }))}
                      disabled={isPending}
                      className="h-8 text-sm"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Validation feedback for EXACT */}
        {splitType === 'EXACT' && totalAmount && (
          <div className={`text-sm ${
            Math.abs(totalExact - totalAmount) < 0.01
              ? 'text-green-600'
              : 'text-amber-600'
          }`}>
            Total: {formatCurrency(totalExact)} / {formatCurrency(totalAmount)}
            {Math.abs(totalExact - totalAmount) < 0.01 && ' \u2713'}
          </div>
        )}

        {/* Validation feedback for PERCENTAGE */}
        {splitType === 'PERCENTAGE' && (
          <div className={`text-sm ${
            Math.abs(totalPercentage - 100) < 0.01 
              ? 'text-green-600' 
              : 'text-amber-600'
          }`}>
            Total: {totalPercentage.toFixed(0)}% / 100%
            {Math.abs(totalPercentage - 100) < 0.01 && ' ✓'}
          </div>
        )}
      </div>

      {/* Submit & Delete */}
      <div className="flex gap-4 pt-4">
        {initialData && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this expense? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button type="submit" className="flex-1" disabled={isPending || !isFormValid()}>
          {isPending ? 'Saving...' : (initialData ? 'Save changes' : 'Add expense')}
        </Button>
      </div>
    </form>
  )
}