import { fetchWithAuth } from "@/app/lib/api"
import { isMockEnabled, MOCK_USER } from "@/app/lib/mock"
import { getSession } from "@/app/lib/session"
import { logout } from "@/app/actions/auth"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { Button } from "@/shadcn/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

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
      return (
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <p className="text-red-500">Error loading profile. Please try again.</p>
        </main>
      )
    }

    user = await res.json()
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">My Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your personal information and account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Your personal information on 0debt</CardDescription>
        </CardHeader>

        <div className="p-6 space-y-4 text-sm">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full border shadow-sm"
          />
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

          <div className="pt-4 flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/me/edit">Edit Profile</Link>
            </Button>
            {!isMockEnabled && (
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm">
                  Sign Out
                </Button>
              </form>
            )}
          </div>
        </div>
      </Card>
    </main>
  )
}
