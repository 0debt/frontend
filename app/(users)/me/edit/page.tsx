import { fetchWithAuth } from "@/app/lib/api"
import { isMockEnabled, MOCK_USER } from "@/app/lib/mock"
import { getSession } from "@/app/lib/session"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { redirect } from "next/navigation"
import EditProfileForm from "./edit-profile-form"

export default async function EditProfilePage() {
  let user

  if (isMockEnabled) {
    user = MOCK_USER
  } else {
    const session = await getSession()
    if (!session) {
      redirect("/sign-in")
    }

    const res = await fetchWithAuth("/users/me", { cache: "no-store" })

    if (res.status === 401) {
      redirect("/sign-in")
    }

    if (!res.ok) {
      return (
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <p className="text-red-500">Error loading profile.</p>
        </main>
      )
    }

    user = await res.json()
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Edit Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Update your personal information.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Account Details</CardTitle>
          <CardDescription>Modify your 0debt account information</CardDescription>
        </CardHeader>
        <EditProfileForm user={user} />
      </Card>
    </main>
  )
}
