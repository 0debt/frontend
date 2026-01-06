import { GroupForm } from '@/app/components/GroupForm'
import { isMockAuthEnabled as isMockEnabled } from '@/app/lib/mock-data/auth'
import { getSession } from '@/app/lib/session'
import { Button } from '@/shadcn/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { redirect } from 'next/navigation'

export default async function NewGroupPage() {
  if (!isMockEnabled) {
    const session = await getSession()

    if (!session) {
      redirect('/sign-in')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/groups">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to groups
        </Link>
      </Button>

      <GroupForm mode="create" />
    </div>
  )
}
