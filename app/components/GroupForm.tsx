'use client'

import { useActionState } from 'react'
import { createGroup, updateGroup, type ActionState } from '@/app/actions/groups'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Input } from '@/shadcn/components/ui/input'
import { Label } from '@/shadcn/components/ui/label'
import type { Group } from '@/app/lib/mock-data/groups'

type GroupFormProps = {
  group?: Group
  mode: 'create' | 'edit'
}

export function GroupForm({ group, mode }: GroupFormProps) {
  const action = mode === 'create'
    ? createGroup
    : (prevState: ActionState, formData: FormData) => updateGroup(group!._id, prevState, formData)

  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create Group' : 'Edit Group'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Create a new group to start tracking shared expenses'
            : 'Update your group details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Summer Vacation 2024"
              defaultValue={group?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g., Trip to Barcelona with friends"
              defaultValue={group?.description}
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? (mode === 'create' ? 'Creating...' : 'Saving...')
              : (mode === 'create' ? 'Create Group' : 'Save Changes')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
