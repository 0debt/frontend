'use client'

import { deleteExpense } from '@/app/actions/expenses'
import {
  Expense,
  formatCurrency,
  getCategoryIcon,
  getCategoryLabel,
  getUserAvatar,
  getUserName,
  isSettlementExpense,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Handshake, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { useState, useTransition } from 'react'

type ExpenseListProps = {
  expenses: Expense[]
  members: UserInfo[]
  groupId: string
}

export function ExpenseList({ expenses, members, groupId }: ExpenseListProps) {
  // Agrupar gastos por fecha
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const dateKey = new Date(expense.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(expense)
    return acc
  }, {} as Record<string, Expense[]>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                {date}
              </h3>
              <div className="space-y-3">
                {dayExpenses.map((expense) => (
                  <ExpenseItem 
                    key={expense._id} 
                    expense={expense} 
                    members={members}
                    groupId={groupId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

type ExpenseItemProps = {
  expense: Expense
  members: UserInfo[]
  groupId: string
}

function ExpenseItem({ expense, members, groupId }: ExpenseItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const payerName = getUserName(expense.payerId, members)
  const payerAvatar = getUserAvatar(expense.payerId, members)
  const participantCount = expense.shares.length
  const isSettlement = isSettlementExpense(expense)
  
  // Mostrar si hubo conversión de divisa
  const wasConverted = expense.exchangeRate !== 1

  const handleDelete = () => {
    startTransition(async () => {
      await deleteExpense(expense._id, groupId)
      setShowDeleteDialog(false)
    })
  }
  
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
      isSettlement ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20' : ''
    }`}>
      {/* Category Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
        isSettlement ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
      }`}>
        {isSettlement ? <Handshake className="h-5 w-5 text-green-600" /> : getCategoryIcon(expense.category)}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{expense.description}</p>
          {isSettlement ? (
            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
              Settlement
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(expense.category)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="h-4 w-4">
            <AvatarImage src={payerAvatar} alt={payerName} />
            <AvatarFallback className="text-[8px]">{payerName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{payerName}</span> paid
            {participantCount > 1 && !isSettlement && (
              <span> • Split between {participantCount}</span>
            )}
            {isSettlement && expense.shares[0] && (
              <span> → {getUserName(expense.shares[0].userId, members)}</span>
            )}
          </p>
        </div>
      </div>
      
      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <p className={`font-semibold ${isSettlement ? 'text-green-600' : ''}`}>
          {formatCurrency(expense.totalAmount)}
        </p>
        {wasConverted && (
          <p className="text-xs text-muted-foreground">
            {formatCurrency(expense.originalAmount, expense.currency)} original
          </p>
        )}
      </div>

      {/* Action Buttons - Only for non-settlement expenses */}
      {!isSettlement && (
        <div className="flex-shrink-0 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            asChild
          >
            <Link href={`/expenses/new?groupId=${groupId}&expenseId=${expense._id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{expense.description}&quot;? 
                  This will update the group balance. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}