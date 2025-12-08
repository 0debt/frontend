'use client'

import { deleteBudget } from '@/app/actions/budgets'
import { Budget, BudgetStatus } from '@/app/lib/mock'
import { Badge } from '@/shadcn/components/ui/badge'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shadcn/components/ui/dialog'
import { Progress } from '@/shadcn/components/ui/progress'
import { Link } from 'next-view-transitions'
import React, { useTransition } from 'react'

const formatEUR = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)

type BudgetCardProps = {
  budget: Budget
  status?: BudgetStatus
}

export function BudgetCard({ budget, status }: BudgetCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

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

  const handleDelete = () => {
    startTransition(() => {
      deleteBudget(budget._id)
    })
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
              {budget.period} • Limit: {formatEUR(budget.limitAmount)}
            </CardDescription>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              Group: {budget.groupId}
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
                  {formatEUR(status.spent)} / {formatEUR(status.limit)}
                </span>
              </div>
              <Progress value={percentage} />
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/budgets/${budget._id}`}>View</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/budgets/${budget._id}/edit`}>Edit</Link>
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Budget</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this budget? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

