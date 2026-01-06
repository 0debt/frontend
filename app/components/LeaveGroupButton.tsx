'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { removeMember } from '@/app/actions/groups'
import { Button } from '@/shadcn/components/ui/button'
import { LogOut } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shadcn/components/ui/alert-dialog'
import { toast } from 'sonner'

type LeaveGroupButtonProps = {
  groupId: string
  groupName: string
  userEmail: string
}

export function LeaveGroupButton({ groupId, groupName, userEmail }: LeaveGroupButtonProps) {
  const router = useRouter()
  const [isLeaving, setIsLeaving] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleLeave() {
    setIsLeaving(true)
    try {
      const result = await removeMember(groupId, userEmail)
      if (result?.error) {
        toast.error(result.error)
        setIsLeaving(false)
        return
      }
      toast.success(`You have left "${groupName}"`)
      router.push('/groups')
      router.refresh()
    } catch (error) {
      toast.error('Failed to leave group')
      setIsLeaving(false)
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" disabled={isLeaving}>
          <LogOut className="h-4 w-4 mr-2" />
          Leave Group
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave group?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave &quot;{groupName}&quot;? You will no longer be able to see expenses or budgets for this group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            disabled={isLeaving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLeaving ? 'Leaving...' : 'Leave Group'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
