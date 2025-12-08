'use client'

import { BudgetActionState, createBudget, updateBudget } from '@/app/actions/budgets'
import { Budget } from '@/app/lib/mock'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Input } from '@/shadcn/components/ui/input'
import { Label } from '@/shadcn/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn/components/ui/select'
import { useActionState, useState } from 'react'
import { NumberInput } from '@/app/components/NumberInput'

type BudgetFormProps = {
  budget?: Budget
  mode: 'create' | 'edit'
}

export function BudgetForm({ budget, mode }: BudgetFormProps) {
  const action = mode === 'create' ? createBudget : (prevState: BudgetActionState, formData: FormData) => 
    updateBudget(budget!._id, prevState, formData)
  
  const [state, formAction, isPending] = useActionState(action, null)
  const [period, setPeriod] = useState(budget?.period || 'monthly')

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
          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                name="category"
                type="text"
                placeholder="e.g., Food, Transport"
                defaultValue={budget?.category}
              />
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
            <input type="hidden" name="groupId" value="demo-group" />
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

