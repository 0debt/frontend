import { BudgetCard } from '@/app/components/BudgetCard'
import { GroupSelector } from '@/app/components/GroupSelector'
import { fetchWithAuth } from '@/app/lib/api'
import { getGroups } from '@/app/lib/groups'
import { Budget, BudgetStatus, isMockBudgetsEnabled, MOCK_BUDGET_STATUSES, MOCK_BUDGETS } from '@/app/lib/mock-data/budgets'
import { isMockAuthEnabled, MOCK_USER } from '@/app/lib/mock-data/auth'
import { getSession } from '@/app/lib/session'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent } from '@/shadcn/components/ui/card'
import { Plus } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { redirect } from 'next/navigation'

async function getBudgets(groupId: string): Promise<Budget[]> {
  if (isMockBudgetsEnabled) {
    return MOCK_BUDGETS.filter(b => b.groupId === groupId)
  }

  try {
    const res = await fetchWithAuth(`/v1/budgets/group/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch budgets: ${res.status}`)
    }

    const data = await res.json()
    return data.budgets || []
  } catch (error) {
    console.error('Error fetching budgets:', error)
    throw error
  }
}

async function getBudgetStatus(budgetId: string): Promise<BudgetStatus | null> {
  if (isMockBudgetsEnabled) {
    return MOCK_BUDGET_STATUSES[budgetId] || null
  }

  try {
    const res = await fetchWithAuth(`/v1/budgets/${budgetId}/status`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    return await res.json()
  } catch (error) {
    console.error('Error fetching budget status:', error)
    return null
  }
}

type Props = {
  searchParams: Promise<{ group?: string }>
}

export default async function BudgetsPage({ searchParams }: Props) {
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
    redirect(`/budgets?group=${groups[0]._id}`)
  }

  const GROUP_ID = selectedGroupId || (groups.length > 0 ? groups[0]._id : '')

  // Get budgets
  let budgetsWithStatus: { budget: Budget; status?: BudgetStatus }[] = []

  if (GROUP_ID) {
    const budgets = await getBudgets(GROUP_ID)

    // Fetch status for each budget in parallel
    budgetsWithStatus = await Promise.all(
      budgets.map(async (budget) => {
        const status = await getBudgetStatus(budget._id)
        return { budget, status: status || undefined }
      })
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your budgets and track spending
          </p>
        </div>
        <div className="flex items-center gap-4">
          <GroupSelector groups={groups} selectedGroupId={GROUP_ID} basePath="/budgets" />
          {GROUP_ID && (
            <Button asChild>
              <Link href={`/budgets/new?groupId=${GROUP_ID}`}>
                <Plus className="mr-2 h-4 w-4" />
                New budget
              </Link>
            </Button>
          )}
        </div>
      </div>

      {budgetsWithStatus.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No budgets yet</p>
            {GROUP_ID ? (
              <Button asChild variant="outline">
                <Link href={`/budgets/new?groupId=${GROUP_ID}`}>
                  Create your first budget
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetsWithStatus.map(({ budget, status }) => {
            const group = groups.find(g => g._id === budget.groupId)
            return (
              <BudgetCard 
                key={budget._id} 
                budget={budget} 
                status={status} 
                groupName={group?.name}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
