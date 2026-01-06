'use client'

import {
    Expense,
    UserInfo,
    formatCurrency,
    getCategoryIcon,
    getCategoryLabel,
    getUserAvatar,
    getUserName,
} from '@/app/lib/expenses'
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar'
import { Badge } from '@/shadcn/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { ScrollArea } from '@/shadcn/components/ui/scroll-area'
import { Link } from 'next-view-transitions'

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
        <ScrollArea className="max-h-[600px] pr-4">
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
        </ScrollArea>
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
  const payerName = getUserName(expense.payerId, members)
  const payerAvatar = getUserAvatar(expense.payerId, members)
  const participantCount = expense.shares.length
  
  // Mostrar si hubo conversión de divisa
  const wasConverted = expense.exchangeRate !== 1
  
  return (
    <Link 
      href={`/expenses/new?groupId=${groupId}&expenseId=${expense._id}`}
      className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      {/* Category Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
        {getCategoryIcon(expense.category)}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{expense.description}</p>
          <Badge variant="outline" className="text-xs">
            {getCategoryLabel(expense.category)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="h-4 w-4">
            <AvatarImage src={payerAvatar} alt={payerName} />
            <AvatarFallback className="text-[8px]">{payerName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{payerName}</span> paid
            {participantCount > 1 && (
              <span> • Split between {participantCount}</span>
            )}
          </p>
        </div>
      </div>
      
      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <p className="font-semibold">{formatCurrency(expense.totalAmount)}</p>
        {wasConverted && (
          <p className="text-xs text-muted-foreground">
            {formatCurrency(expense.originalAmount, expense.currency)} original
          </p>
        )}
      </div>
    </Link>
  )
}