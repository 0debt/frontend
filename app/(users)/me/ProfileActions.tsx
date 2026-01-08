'use client'

import { deleteAccount, logout } from "@/app/actions/auth"
import { NotificationPreferencesModal } from "@/app/components/NotificationPreferencesModal"
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
} from "@/shadcn/components/ui/alert-dialog"
import { Button } from "@/shadcn/components/ui/button"
import { Bell, LogOut, Trash2, UserPen } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"

interface ProfileActionsProps {
  userId: string
  email: string
  isMock: boolean
}

export function ProfileActions({ userId, email, isMock }: ProfileActionsProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDeleteAccount = () => {
    startTransition(async () => {
      const result = await deleteAccount(userId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Account deleted successfully")
      }
    })
  }

  return (
    <>
      <div className="pt-4 flex gap-2 flex-wrap justify-center">
        <Button asChild variant="outline" size="sm" disabled={isPending}>
          <Link href="/me/edit">
            <UserPen className="w-4 h-4 mr-2" />
            Edit profile
          </Link>
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowNotifications(true)}
          disabled={isPending}
        >
          <Bell className="w-4 h-4 mr-2" />
          Manage notifications
        </Button>

        {!isMock && (
          <form action={logout}>
            <Button 
              variant="outline" 
              size="sm" 
              type="submit" 
              disabled={isPending}
              className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </form>
        )}
      </div>

      {!isMock && (
        <div className="mt-4 pt-4 border-t flex justify-center w-full">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isPending} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" />
                {isPending ? "Deleting..." : "Delete account"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <NotificationPreferencesModal
        userId={userId}
        email={email}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        mode="edit"
      />
    </>
  )
}
