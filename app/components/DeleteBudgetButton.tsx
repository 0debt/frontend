'use client'

import React from 'react'
import { useTransition } from 'react'
import { Button, ButtonProps } from '@/shadcn/components/ui/button'
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
import { cn } from '@/lib/utils'

type DeleteBudgetButtonProps = {
  budgetId: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  showIcon?: boolean
}

export function DeleteBudgetButton({ 
  budgetId,
  variant = "destructive",
  size = "default",
  className,
  showIcon = true
}: DeleteBudgetButtonProps) {
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
        <Button variant={variant} size={size} className={cn(className)}>
          {showIcon && <Trash2 className="mr-2 h-4 w-4" />}
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete budget</DialogTitle>
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




