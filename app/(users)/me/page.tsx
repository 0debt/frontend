import { fetchWithAuth } from "@/app/lib/api"
import { isMockAuthEnabled as isMockEnabled, MOCK_USER } from "@/app/lib/mock-data/auth";

import { getSession } from "@/app/lib/session"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { redirect } from "next/navigation"
import { ProfileActions } from "./ProfileActions"

import Image from "next/image"

type User = {
  _id: string
  name: string
  email: string
  avatar: string
  plan: string
}

export default async function ProfilePage() {
  let user: User

  if (isMockEnabled) {
    user = MOCK_USER
  } else {
    const session = await getSession()

    if (!session) {
      redirect("/sign-in")
    }

    const res = await fetchWithAuth("/users/me", {
      cache: "no-store",
    })

    if (res.status === 401) {
      redirect("/sign-in")
    }

    if (!res.ok) {
      throw new Error("Failed to load profile")
    }

    user = await res.json()
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">My profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your personal information and account details.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Account details</CardTitle>
          <CardDescription>Your personal information on 0debt</CardDescription>
        </CardHeader>

        <div className="px-6 text-sm">
          <div className="flex justify-between items-start gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{user.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium capitalize">{user.plan}</span>
              </div>
            </div>

            <Image
              src={user.avatar}
              alt={user.name}
              width={80}
              height={80}
              className="rounded-full border shadow-sm"
              unoptimized
            />
          </div>

          <ProfileActions 
            userId={user._id} 
            email={user.email} 
            isMock={isMockEnabled} 
          />
        </div>
      </Card>
    </main>
  )
}
