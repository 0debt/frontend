import { GroupCard } from '@/app/components/GroupCard'
import { fetchWithAuth } from '@/app/lib/api'
import { getGroups } from '@/app/lib/groups'
import { isMockAuthEnabled as isMockEnabled, MOCK_USER } from '@/app/lib/mock-data/auth'
import { getSession } from '@/app/lib/session'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent } from '@/shadcn/components/ui/card'
import { Plus } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { redirect } from 'next/navigation'

export default async function GroupsPage() {
  let user

  if (isMockEnabled) {
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

  const groups = await getGroups(user._id)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My groups</h1>
          <p className="text-muted-foreground mt-1">
            Manage your expense groups
          </p>
        </div>
        <Button asChild>
          <Link href="/groups/new">
            <Plus className="h-4 w-4 mr-2" />
            New group
          </Link>
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any groups yet.
            </p>
            <Button asChild variant="outline">
              <Link href="/groups/new">Create your first group</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              isOwner={group.ownerId === user._id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
