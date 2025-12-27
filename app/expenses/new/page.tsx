import { ExpenseForm } from '@/app/components/ExpenseForm'
import { fetchWithAuth } from '@/app/lib/api'
import {
    isMockEnabled,
    MOCK_USERS,
    UserInfo,
} from '@/app/lib/expenses'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'next-view-transitions'

type Props = {
  searchParams: Promise<{ groupId?: string }>
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

// Obtener el usuario actual (quien está logueado)
async function getCurrentUser(): Promise<UserInfo | null> {
  if (isMockEnabled) {
    return MOCK_USERS[0] // Primer usuario como current
  }

  try {
    const res = await fetchWithAuth('/users/me', {
      cache: 'no-store',
    })

    if (!res.ok) {
      return MOCK_USERS[0]
    }

    const data = await res.json()
    return {
      _id: data._id,
      name: data.name,
      avatar: data.avatar
    }
  } catch {
    return MOCK_USERS[0]
  }
}

export default async function NewExpensePage({ searchParams }: Props) {
  const { groupId = 'demo-group' } = await searchParams
  const members = await getGroupMembers(groupId)
  const currentUser = await getCurrentUser()

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Expense</h1>
          <p className="mt-1 text-muted-foreground">
            Record a new shared expense
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            Fill in the details of your expense. Amounts will be automatically converted to EUR if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm 
            groupId={groupId} 
            members={members} 
            currentUserId={currentUser?._id || members[0]?._id || ''} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
