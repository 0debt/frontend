'use client'

import { logout } from "@/app/actions/auth"
import { NotificationPreferencesModal } from "@/app/components/NotificationPreferencesModal"
import { Button } from "@/shadcn/components/ui/button"
import { Bell, LogOut, UserPen } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface ProfileActionsProps {
  userId: string
  email: string
  isMock: boolean
}

export function ProfileActions({ userId, email, isMock }: ProfileActionsProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <>
      <div className="pt-8 flex gap-2 flex-wrap justify-center">
        <Button asChild variant="outline" size="sm">
          <Link href="/me/edit">
            <UserPen className="w-4 h-4 mr-2" />
            Edit profile
          </Link>
        </Button>

        <Button variant="outline" size="sm" onClick={() => setShowNotifications(true)}>
          <Bell className="w-4 h-4 mr-2" />
          Manage notifications
        </Button>

        {!isMock && (
          <form action={logout}>
            <Button variant="destructive" size="sm" type="submit">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </form>
        )}
      </div>

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
