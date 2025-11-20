import { Card, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import EditProfileForm from "./edit-profile-form"

const MOCK = true

export default async function EditProfilePage() {
  let user

  if (MOCK) {
    user = {
      name: "sonia",
      email: "sonia@gmail.com",
      plan: "FREE",
    }
  } else {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      redirect("/sign-in")
    }

    const res = await fetch("https://api.0debt.xyz/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (res.status === 401) {
      redirect("/sign-in")
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

        <EditProfileForm user={user} mock={MOCK} />
      </Card>

    </main>
  )
}
