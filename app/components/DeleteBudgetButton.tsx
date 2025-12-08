'use client'

import React from 'react'
import { useTransition } from 'react'
import { Button } from '@/shadcn/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteBudget } from '@/app/actions/budgets'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shadcn/components/ui/dialog'

type DeleteBudgetButtonProps = {
  budgetId: string
}

export function DeleteBudgetButton({ budgetId }: DeleteBudgetButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleDelete = () => {
    startTransition(() => {
      deleteBudget(budgetId)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
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
            onClick={() => setIsOpen(false)}
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
  )
}




