'use client'

import { createExpense, ExpenseActionState } from '@/app/actions/expenses'
import {
    ExpenseCategory,
    formatCurrency,
    getUserAvatar,
    SplitType,
    UserInfo,
} from '@/app/lib/expenses'
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
import { AlertCircle, Check } from 'lucide-react'
import Image from 'next/image'
import { useActionState, useEffect, useState } from 'react'

type ExpenseFormProps = {
  groupId: string
  members: UserInfo[]
  currentUserId: string
}

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'FOOD', label: 'Food & Drinks', icon: '🍔' },
  { value: 'TRANSPORT', label: 'Transport', icon: '🚗' },
  { value: 'ACCOMMODATION', label: 'Accommodation', icon: '🏨' },
  { value: 'ENTERTAINAMENT', label: 'Entertainment', icon: '🎬' },
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

export function ExpenseForm({ groupId, members, currentUserId }: ExpenseFormProps) {
  const [state, formAction, isPending] = useActionState<ExpenseActionState, FormData>(
    createExpense,
    null
  )

  const [payerId, setPayerId] = useState(currentUserId)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    members.map(m => m._id)
  )
  const [splitType, setSplitType] = useState<SplitType>('EQUAL')
  const [totalAmount, setTotalAmount] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({})
  const [percentages, setPercentages] = useState<Record<string, string>>({})

  // Calcular el share igual
  const equalShare = selectedParticipants.length > 0 && totalAmount
    ? parseFloat(totalAmount) / selectedParticipants.length
    : 0

  // Calcular total de exact amounts
  const totalExact = Object.entries(exactAmounts)
    .filter(([userId]) => selectedParticipants.includes(userId))
    .reduce((sum, [, amount]) => sum + (parseFloat(amount) || 0), 0)

  // Calcular total de porcentajes
  const totalPercentage = Object.entries(percentages)
    .filter(([userId]) => selectedParticipants.includes(userId))
    .reduce((sum, [, pct]) => sum + (parseFloat(pct) || 0), 0)

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Reset exact/percentage cuando cambia el split type
  useEffect(() => {
    if (splitType === 'EQUAL') {
      setExactAmounts({})
      setPercentages({})
    }
  }, [splitType])

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
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
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
          required
          disabled={isPending}
        />
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="totalAmount">Amount</Label>
          <Input
            id="totalAmount"
            name="totalAmount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            required
            disabled={isPending}
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
        <Select name="category" defaultValue="OTHER" disabled={isPending}>
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
              <Image
                src={getUserAvatar(member._id, members)}
                alt={member.name}
                width={32}
                height={32}
                className="rounded-full"
              />
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
                  <Image
                    src={getUserAvatar(member._id, members)}
                    alt={member.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
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
            Math.abs(totalExact - parseFloat(totalAmount)) < 0.01 
              ? 'text-green-600' 
              : 'text-amber-600'
          }`}>
            Total: {formatCurrency(totalExact)} / {formatCurrency(parseFloat(totalAmount))}
            {Math.abs(totalExact - parseFloat(totalAmount)) < 0.01 && ' ✓'}
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

      {/* Submit */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={isPending || selectedParticipants.length === 0}>
          {isPending ? 'Creating...' : 'Add Expense'}
        </Button>
      </div>
    </form>
  )
}