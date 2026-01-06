import { BudgetForm } from '@/app/components/BudgetForm'
import { fetchWithAuth } from '@/app/lib/api'
import { getGroups } from '@/app/lib/groups'
import { isMockAuthEnabled } from '@/app/lib/mock-data/auth'
import { MOCK_USER } from '@/app/lib/mock-data/auth'
import { getSession } from '@/app/lib/session'
import { Button } from '@/shadcn/components/ui/button'
import { Link } from 'next-view-transitions'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

type Props = {
  searchParams: Promise<{ groupId?: string }>
}

export default async function NewBudgetPage({ searchParams }: Props) {
  const { groupId } = await searchParams

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

  // Get groups
  const groups = await getGroups(user._id)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={groupId ? `/budgets?group=${groupId}` : "/budgets"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create budget</h1>
          <p className="mt-1 text-muted-foreground">
            Set up a new budget to track your spending
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <BudgetForm mode="create" groups={groups} budget={groupId ? { groupId } as any : undefined} />
        </div>
      </div>
    </div>
  )
}




