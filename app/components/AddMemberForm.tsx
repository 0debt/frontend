'use client'

import { useActionState } from 'react'
import { addMember, type ActionState } from '@/app/actions/groups'
import { Button } from '@/shadcn/components/ui/button'
import { Input } from '@/shadcn/components/ui/input'
import { UserPlus } from 'lucide-react'

type AddMemberFormProps = {
  groupId: string
}

export function AddMemberForm({ groupId }: AddMemberFormProps) {
  const addMemberWithId = (prevState: ActionState, formData: FormData) => 
    addMember(groupId, prevState, formData)

  const [state, formAction, isPending] = useActionState(addMemberWithId, null)

  return (
    <div className="space-y-2 pt-4 border-t">
      <form action={formAction} className="flex gap-2">
        <Input
          name="email"
          type="email"
          placeholder="Add member by email..."
          className="flex-1"
          required
        />
        <Button type="submit" size="sm" disabled={isPending}>
          <UserPlus className="h-4 w-4" />
          <span className="sr-only">Add Member</span>
        </Button>
      </form>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </div>
  )
}
