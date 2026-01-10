import { removeMember } from '@/app/actions/groups'
import { AddMemberForm } from '@/app/components/AddMemberForm'
import { DeleteGroupButton } from '@/app/components/DeleteGroupButton'
import { LeaveGroupButton } from '@/app/components/LeaveGroupButton'
import { fetchWithAuth } from '@/app/lib/api'
import { getGroup, getGroupMembers } from '@/app/lib/groups'
import { isMockAuthEnabled as isMockEnabled, MOCK_USER } from '@/app/lib/mock-data/auth'
import { getSession } from '@/app/lib/session'
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar'
import { Badge } from '@/shadcn/components/ui/badge'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { ArrowLeft, Crown, Edit, PiggyBank, Receipt, UserMinus, Users } from 'lucide-react'
import { Link } from 'next-view-transitions'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export default async function GroupDetailPage({ params }: Props) {
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

  const members = await getGroupMembers(id)
  const isOwner = group.ownerId === user._id

  async function handleRemoveMember(memberEmail: string) {
    'use server'
    await removeMember(id, memberEmail)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/groups">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to groups
          </Link>
        </Button>

        {/* Banner Image */}
        {group.imageUrl && (
          <div className="w-full rounded-lg overflow-hidden border shadow-sm aspect-5/1 max-h-50 relative">
            <Image 
              src={group.imageUrl} 
              alt={group.name} 
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              priority
              draggable={false}
            />
          </div>
        )}

        {/* Header */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{group.name}</h1>
                {isOwner && (
                  <Badge variant="secondary">
                    <Crown className="h-3 w-3 mr-1" />
                    Owner
                  </Badge>
                )}
              </div>
              {group.description && (
                <p className="text-muted-foreground mt-2">{group.description}</p>
              )}
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/groups/${id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <DeleteGroupButton groupId={id} groupName={group.name} />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({members.length})
            </CardTitle>
            <CardDescription>
              People in this group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} alt={member.name} draggable={false} />
                    <AvatarFallback>{member.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{member.name}</span>
                  {member._id === group.ownerId && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                {isOwner && member._id !== user._id && (
                  <form action={handleRemoveMember.bind(null, member.email)}>
                    <Button variant="ghost" size="sm" type="submit">
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            ))}

            {isOwner && (
              <AddMemberForm groupId={id} />
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/expenses?group=${id}`}>
                <Receipt className="h-4 w-4 mr-2" />
                View Expenses
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/budgets?group=${id}`}>
                <PiggyBank className="h-4 w-4 mr-2" />
                View Budgets
              </Link>
            </Button>
            {!isOwner && (
              <LeaveGroupButton 
                groupId={id} 
                groupName={group.name} 
                userEmail={user.email} 
              />
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
