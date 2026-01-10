'use client'

import { Budget, BudgetStatus } from '@/app/lib/mock-data/budgets'
import { Badge } from '@/shadcn/components/ui/badge'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Progress } from '@/shadcn/components/ui/progress'
import { Link } from 'next-view-transitions'
import React from 'react'
import { DeleteBudgetButton } from './DeleteBudgetButton'

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value)
  }

type BudgetCardProps = {
  budget: Budget
  status?: BudgetStatus
  groupName?: string
}

export function BudgetCard({ budget, status, groupName }: BudgetCardProps) {
  const percentage = status ? Math.min((status.spent / status.limit) * 100, 100) : 0

  const getHealthBadgeVariant = (health?: BudgetStatus['health']) => {
    switch (health) {
      case 'OK':
        return 'default'
      case 'WARNING':
        return 'secondary'
      case 'OVERBUDGET':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getProgressColor = (health?: BudgetStatus['health']) => {
    switch (health) {
      case 'OK':
        return 'bg-primary'
      case 'WARNING':
        return 'bg-secondary'
      case 'OVERBUDGET':
        return 'bg-destructive'
      default:
        return 'bg-primary'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {budget.category || 'General'}
            </CardTitle>
            <CardDescription className="mt-1">
              {budget.period} • Limit: {formatCurrency(budget.limitAmount)}
            </CardDescription>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              Group: {groupName || budget.groupId}
            </CardDescription>
          </div>
          {status && (
            <Badge variant={getHealthBadgeVariant(status.health)}>
              {status.health}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {status && (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-medium">
                  {formatCurrency(status.spent)} / {formatCurrency(status.limit)}
                </span>
              </div>
              <Progress value={percentage} indicatorClassName={getProgressColor(status.health)} />
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/budgets/view?budgetId=${budget._id}&groupId=${budget.groupId}`}>View</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/budgets/edit?budgetId=${budget._id}&groupId=${budget.groupId}&redirectUrl=${encodeURIComponent(`/budgets?group=${budget.groupId}`)}`}>Edit</Link>
          </Button>
          <DeleteBudgetButton 
            budgetId={budget._id} 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive" 
            showIcon={false} 
          />
        </div>
      </CardContent>
    </Card>
  )
}

