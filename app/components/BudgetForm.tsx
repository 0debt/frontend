'use client'

import { BudgetActionState, createBudget, updateBudget } from '@/app/actions/budgets'
import { NumberInput } from '@/app/components/NumberInput'
import { Budget } from '@/app/lib/mock-data/budgets'
import { Group } from '@/app/lib/mock-data/groups'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Label } from '@/shadcn/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn/components/ui/select'
import { useActionState, useState } from 'react'

type BudgetFormProps = {
  budget?: Partial<Budget>
  mode: 'create' | 'edit'
  groups?: Group[]
}

const CATEGORIES = [
  { value: 'FOOD', label: 'Food & Dining' },
  { value: 'TRANSPORT', label: 'Transportation' },
  { value: 'ACCOMMODATION', label: 'Accommodation' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'OTHER', label: 'Other' },
]

export function BudgetForm({ budget, mode, groups = [] }: BudgetFormProps) {
  const action = mode === 'create' ? createBudget : (prevState: BudgetActionState, formData: FormData) =>
    updateBudget(budget?._id || '', prevState, formData)

  const [state, formAction, isPending] = useActionState(action, null)
  const [period, setPeriod] = useState(budget?.period || 'monthly')
  const [selectedGroup, setSelectedGroup] = useState(budget?.groupId || groups[0]?._id || '')
  const [category, setCategory] = useState(budget?.category || 'ALL')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create Budget' : 'Edit Budget'}</CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Create a new budget to track your spending'
            : 'Update your budget limit'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="groupId" value={selectedGroup || budget?.groupId} />
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <input type="hidden" name="category" value={category === 'ALL' ? '' : category} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All categories (General budget)</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Leave empty or select "All categories" for a general group budget.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="limitAmount">
              Limit Amount <span className="text-destructive">*</span>
            </Label>
            <NumberInput
                id="limitAmount"
                name="limitAmount"
              allowNegative={false}
              decimalSeparator=","
              thousandSeparator="."
              decimalScale={2}
              fixedDecimalScale
              min={0}
              placeholder="500,00 €"
                required
                defaultValue={budget?.limitAmount}
              suffix=" €"
              />
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="period">
                Period <span className="text-destructive">*</span>
              </Label>
              <input type="hidden" name="period" value={period} />
              <Select value={period} onValueChange={setPeriod} required>
                <SelectTrigger id="period" className="w-full">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="trip">Trip</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="groupId">
                Group <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup} required>
                <SelectTrigger id="groupId" className="w-full">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending 
              ? (mode === 'create' ? 'Creating...' : 'Updating...')
              : (mode === 'create' ? 'Create Budget' : 'Update Budget')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

