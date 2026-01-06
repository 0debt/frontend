import { ExpenseList } from '@/app/components/ExpenseList'
import { GroupSelector } from '@/app/components/GroupSelector'
import { fetchWithAuth } from '@/app/lib/api'
import {
  Expense,
  formatCurrency,
  GroupStats,
  UserInfo,
} from '@/app/lib/expenses'
import { getGroups } from '@/app/lib/groups'
import { isMockAuthEnabled, MOCK_USER } from '@/app/lib/mock-data/auth'
import { isMockExpensesEnabled, MOCK_EXPENSES, MOCK_USERS } from '@/app/lib/mock-data/expenses'
import { getSession } from '@/app/lib/session'
import { getUsersByIds } from '@/app/lib/users'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { ArrowRightLeft, Plus, TrendingUp } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { redirect } from 'next/navigation'

async function getExpenses(groupId: string): Promise<Expense[]> {
  if (isMockExpensesEnabled) {
    return MOCK_EXPENSES.filter(e => e.groupId === groupId)
  }

  try {
    const res = await fetchWithAuth(`/expenses/groups/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch expenses: ${res.status}`)
    }

    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching expenses:', error)
    throw error
  }
}

function calculateGroupStats(expenses: Expense[]): GroupStats {
  const stats: GroupStats = {
    totalSpent: 0,
    count: 0,
    byCategory: {},
  }

  expenses.forEach(expense => {
    if (expense.isSettlement) {
      return
    }
    stats.totalSpent += expense.totalAmount
    stats.count += 1
    const category = expense.category || 'OTHER'
    stats.byCategory[category] = (stats.byCategory[category] || 0) + expense.totalAmount
  })

  return stats
}

async function getGroupStats(groupId: string, expenses: Expense[]): Promise<GroupStats | null> {
  // En el frontend, calculamos las estadísticas localmente a partir de los gastos ya descargados.
  // El endpoint /internal/stats es para comunicación entre microservicios y no está expuesto en el Gateway.
  return calculateGroupStats(expenses)
}

async function getGroupMembers(groupId: string): Promise<UserInfo[]> {
  if (isMockExpensesEnabled) {
    return MOCK_USERS
  }

  try {
    // 1. Get group summary to get member IDs
    const res = await fetchWithAuth(`/groups/${groupId}/summary`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    const memberIds = data.members || []

    if (memberIds.length === 0) return []

    // 2. Fetch user details for these IDs
    return await getUsersByIds(memberIds)
  } catch (error) {
    console.error('Error fetching group members:', error)
    return []
  }
}

type Props = {
  searchParams: Promise<{ group?: string }>
}

export default async function ExpensesPage({ searchParams }: Props) {
  // Get user
  let user
  if (isMockAuthEnabled) {
    user = MOCK_USER
  } else {
    const session = await getSession()
    if (!session) {
      redirect('/sign-in')
    }
    const res = await fetchWithAuth('/users/me', { cache: 'no-store' })
    if (!res.ok) {
      redirect('/sign-in')
    }
    user = await res.json()
  }

  // Get groups and selected group
  const { group: selectedGroupId } = await searchParams
  const groups = await getGroups(user._id)

  if (groups.length > 0 && !selectedGroupId) {
    redirect(`/expenses?group=${groups[0]._id}`)
  }

  const GROUP_ID = selectedGroupId || (groups.length > 0 ? groups[0]._id : '')
  
  // Get expenses
  let expenses: Expense[] = []
  let stats: GroupStats | null = null
  let members: UserInfo[] = []

  if (GROUP_ID) {
    expenses = await getExpenses(GROUP_ID)
    stats = await getGroupStats(GROUP_ID, expenses)
    members = await getGroupMembers(GROUP_ID)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage group expenses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <GroupSelector groups={groups} selectedGroupId={GROUP_ID} />
          {GROUP_ID && (
            <>
              <Button asChild variant="outline">
                <Link href={`/expenses/settle?group=${GROUP_ID}`}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Settle Up
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/expenses/new?groupId=${GROUP_ID}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add expense
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total spent</CardDescription>
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
                      <CardDescription>Top category</CardDescription>
                      <CardTitle className="text-2xl">                {Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
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
              Spending by category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => {
                  const percentage = (amount / stats!.totalSpent) * 100
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
            <p className="text-muted-foreground mb-4">No expenses yet</p>
            {GROUP_ID ? (
              <Button asChild variant="outline">
                <Link href={`/expenses/new?groupId=${GROUP_ID}`}>
                  Add your first expense
                </Link>
              </Button>
            ) : (
               <Button asChild variant="outline">
                <Link href="/groups/new">
                  Create a group to start
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ExpenseList expenses={expenses} members={members} groupId={GROUP_ID} />
      )}
    </div>
  )
}
