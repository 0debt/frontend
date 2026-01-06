import { GroupForm } from '@/app/components/GroupForm'
import { fetchWithAuth } from '@/app/lib/api'
import { getGroup } from '@/app/lib/groups'
import { isMockAuthEnabled as isMockEnabled, MOCK_USER } from '@/app/lib/mock-data/auth'
import { getSession } from '@/app/lib/session'
import { Button } from '@/shadcn/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { notFound, redirect } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditGroupPage({ params }: Props) {
  const { id } = await params

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

  const group = await getGroup(id)

  if (!group) {
    notFound()
  }

  // Only owner can edit
  if (group.ownerId !== user._id) {
    redirect(`/groups/${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/groups/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to group
        </Link>
      </Button>

      <GroupForm mode="edit" group={group} />
    </div>
  )
}
