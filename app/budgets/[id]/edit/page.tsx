import { fetchWithAuth } from '@/app/lib/api'
import { isMockEnabled, MOCK_BUDGETS, Budget } from '@/app/lib/mock'
import { BudgetForm } from '@/app/components/BudgetForm'
import { Button } from '@/shadcn/components/ui/button'
import { Link } from 'next-view-transitions'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

async function getBudget(id: string): Promise<Budget | null> {
  if (isMockEnabled) {
    return MOCK_BUDGETS.find(b => b._id === id) || null
  }

  try {
    // We need to find the budget by searching through groups
    // For now, we'll use demo-group
    const res = await fetchWithAuth(`/v1/budgets/group/demo-group`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    const budget = data.budgets?.find((b: Budget) => b._id === id)
    return budget || null
  } catch (error) {
    console.error('Error fetching budget:', error)
    return null
  }
}

export default async function EditBudgetPage({ params }: Props) {
  const { id } = await params
  const budget = await getBudget(id)

  if (!budget) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/budgets/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Budget</h1>
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




