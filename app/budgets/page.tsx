import { fetchWithAuth } from '@/app/lib/api'
import { isMockEnabled, MOCK_BUDGETS, MOCK_BUDGET_STATUSES, Budget, BudgetStatus } from '@/app/lib/mock'
import { BudgetCard } from '@/app/components/BudgetCard'
import { Button } from '@/shadcn/components/ui/button'
import { Link } from 'next-view-transitions'
import { Plus } from 'lucide-react'

const GROUP_ID = 'demo-group'

async function getBudgets(groupId: string): Promise<Budget[]> {
  if (isMockEnabled) {
    return MOCK_BUDGETS.filter(b => b.groupId === groupId)
  }

  try {
    const res = await fetchWithAuth(`/v1/budgets/group/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('Failed to fetch budgets:', res.status)
      return []
    }

    const data = await res.json()
    return data.budgets || []
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return []
  }
}

async function getBudgetStatus(budgetId: string): Promise<BudgetStatus | null> {
  if (isMockEnabled) {
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

export default async function BudgetsPage() {
  const budgets = await getBudgets(GROUP_ID)
  
  // Fetch status for each budget in parallel
  const budgetsWithStatus = await Promise.all(
    budgets.map(async (budget) => {
      const status = await getBudgetStatus(budget._id)
      return { budget, status: status || undefined }
    })
  )

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your budgets and track spending
          </p>
        </div>
        <Button asChild>
          <Link href="/budgets/new">
            <Plus className="mr-2 h-4 w-4" />
            New Budget
          </Link>
        </Button>
      </div>

      {budgetsWithStatus.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No budgets yet</p>
          <Button asChild variant="outline">
            <Link href="/budgets/new">Create your first budget</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetsWithStatus.map(({ budget, status }) => (
            <BudgetCard key={budget._id} budget={budget} status={status} />
          ))}
        </div>
      )}
    </div>
  )
}




