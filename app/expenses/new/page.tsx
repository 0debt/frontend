import { ExpenseForm } from '@/app/components/ExpenseForm'
import { fetchWithAuth } from '@/app/lib/api'
import { UserInfo, Expense } from '@/app/lib/expenses'
import { getGroup } from '@/app/lib/groups'
import { isMockExpensesEnabled as isMockEnabled, MOCK_USERS, MOCK_EXPENSES } from '@/app/lib/mock-data/expenses'
import { getUsersByIds } from '@/app/lib/users'
import { Badge } from '@/shadcn/components/ui/badge'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'next-view-transitions'

type Props = {
  searchParams: Promise<{ groupId?: string; expenseId?: string }>
}

async function getGroupMembers(groupId: string): Promise<UserInfo[]> {
  if (isMockEnabled) {
    return MOCK_USERS
  }

  try {
    const res = await fetchWithAuth(`/groups/${groupId}/summary`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.warn(`Failed to fetch group members for ${groupId}`)
      return []
    }

    const data = await res.json()
    const memberIds = data.members || []
    
    if (memberIds.length === 0) return []

    return await getUsersByIds(memberIds)
  } catch (error) {
    console.error('Error fetching group members:', error)
    return []
  }
}

async function getExpense(groupId: string, expenseId: string): Promise<Expense | null> {
  if (isMockEnabled) {
    return MOCK_EXPENSES.find(e => e._id === expenseId) || null
  }

  try {
    const res = await fetchWithAuth(`/expenses/groups/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) return null

    const data = await res.json()
    const expenses = data.data || []
    return expenses.find((e: Expense) => e._id === expenseId) || null
  } catch {
    return null
  }
}

// Get current user (who is logged in)
async function getCurrentUser(): Promise<UserInfo | null> {
  if (isMockEnabled) {
    return MOCK_USERS[0]
  }

  try {
    const res = await fetchWithAuth('/users/me', {
      cache: 'no-store',
    })

    if (!res.ok) return null

    const data = await res.json()
    return { _id: data._id, name: data.name, avatar: data.avatar }
  } catch {
    return null
  }
}

export default async function NewExpensePage({ searchParams }: Props) {
  const { groupId = 'demo-group', expenseId } = await searchParams
  const members = await getGroupMembers(groupId)
  const currentUser = await getCurrentUser()
  const group = await getGroup(groupId)
  
  let initialData = null
  if (expenseId) {
    initialData = await getExpense(groupId, expenseId)
  }

  const isEditing = !!expenseId

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/expenses?group=${groupId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? 'Edit expense' : 'Add expense'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEditing ? 'Update the details of your expense' : 'Record a new shared expense'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Expense details</CardTitle>
          {group && (
            <Badge variant="secondary" className="font-medium bg-primary/10 text-primary border-none py-1 px-3">
              <span className="text-[10px] uppercase opacity-60 mr-1.5 font-bold tracking-wider">Group:</span>
              {group.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <ExpenseForm 
            groupId={groupId} 
            members={members} 
            currentUserId={currentUser?._id || members[0]?._id || ''}
            initialData={initialData || undefined}
          />
        </CardContent>
      </Card>
    </div>
  )
}