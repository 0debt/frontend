import { ExpenseList } from '@/app/components/ExpenseList'
import { fetchWithAuth } from '@/app/lib/api'
import {
    Expense,
    formatCurrency,
    GroupStats,
    isMockEnabled,
    MOCK_EXPENSES,
    MOCK_STATS,
    MOCK_USERS,
    UserInfo,
} from '@/app/lib/expenses'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { ArrowLeft, ArrowRightLeft, Plus, TrendingUp } from 'lucide-react'
import { Link } from 'next-view-transitions'

type Props = {
  params: Promise<{ groupId: string }>
}

async function getExpenses(groupId: string): Promise<Expense[]> {
  if (isMockEnabled) {
    return MOCK_EXPENSES.filter(e => e.groupId === groupId)
  }

  try {
    const res = await fetchWithAuth(`/expenses/groups/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('Failed to fetch expenses:', res.status)
      return []
    }

    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
}

async function getGroupStats(groupId: string): Promise<GroupStats | null> {
  if (isMockEnabled) {
    return MOCK_STATS
  }

  try {
    const res = await fetchWithAuth(`/internal/stats/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.data || null
  } catch (error) {
    console.error('Error fetching stats:', error)
    return null
  }
}

async function getGroupMembers(groupId: string): Promise<UserInfo[]> {
  if (isMockEnabled) {
    return MOCK_USERS
  }

  try {
    const res = await fetchWithAuth(`/groups/${groupId}/members`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return MOCK_USERS
    }

    const data = await res.json()
    return data.members || MOCK_USERS
  } catch {
    return MOCK_USERS
  }
}

async function getGroupInfo(groupId: string): Promise<{ name: string } | null> {
  if (isMockEnabled) {
    return { name: 'Demo Group' }
  }

  try {
    const res = await fetchWithAuth(`/groups/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return { name: groupId }
    }

    const data = await res.json()
    return { name: data.name || groupId }
  } catch {
    return { name: groupId }
  }
}

export default async function GroupExpensesPage({ params }: Props) {
  const { groupId } = await params
  const [expenses, stats, members, groupInfo] = await Promise.all([
    getExpenses(groupId),
    getGroupStats(groupId),
    getGroupMembers(groupId),
    getGroupInfo(groupId),
  ])

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{groupInfo?.name || 'Group'} Expenses</h1>
          <p className="mt-1 text-muted-foreground">
            Track and manage expenses for this group
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/expenses/${groupId}/settle`}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Settle Up
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/expenses/new?groupId=${groupId}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Spent</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(stats.totalSpent)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.count} expenses recorded
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Top Category</CardDescription>
              <CardTitle className="text-2xl">
                {Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0]?.[1] || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Members</CardDescription>
              <CardTitle className="text-2xl">{members.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Splitting expenses
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Breakdown */}
      {stats && Object.keys(stats.byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => {
                  const percentage = (amount / stats.totalSpent) * 100
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{category.toLowerCase()}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No expenses yet in this group</p>
            <Button asChild variant="outline">
              <Link href={`/expenses/new?groupId=${groupId}`}>
                Add your first expense
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ExpenseList expenses={expenses} members={members} groupId={groupId} />
      )}
    </div>
  )
}
