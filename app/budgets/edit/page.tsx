import { fetchWithAuth } from '@/app/lib/api'
import { isMockBudgetsEnabled as isMockEnabled, MOCK_BUDGETS, Budget } from '@/app/lib/mock-data/budgets'
import { BudgetForm } from '@/app/components/BudgetForm'
import { Button } from '@/shadcn/components/ui/button'
import { Link } from 'next-view-transitions'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

type Props = {
  searchParams: Promise<{ budgetId: string, groupId: string }>
}

async function getBudget(budgetId: string, groupId: string): Promise<Budget | null> {
  if (isMockEnabled) {
    return MOCK_BUDGETS.find(b => b._id === budgetId) || null
  }

  try {
    const res = await fetchWithAuth(`/v1/budgets/group/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    const budgets = data.budgets || []
    return budgets.find((b: Budget) => b._id === budgetId) || null
  } catch (error) {
    console.error('Error fetching budget:', error)
    return null
  }
}

export default async function EditBudgetPage({ searchParams }: Props) {
  const { budgetId, groupId } = await searchParams

  if (!budgetId || !groupId) {
    notFound()
  }

  const budget = await getBudget(budgetId, groupId)

  if (!budget) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/budgets/view?budgetId=${budgetId}&groupId=${groupId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit budget</h1>
          <p className="mt-1 text-muted-foreground">
            Update your budget limit
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <BudgetForm mode="edit" budget={budget} />
        </div>
      </div>
    </div>
  )
}
