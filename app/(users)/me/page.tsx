import { Card, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// cambiar esto al integrar el microservicio!
const MOCK = true

export default async function ProfilePage() {
  let user
  //datos de prueba
  if (MOCK) {
    user = {
      name: "sonia",
      email: "sonia@gmail.com",
      plan: "FREE",
      createdAt: "1970-01-01T00:00:00.000Z",
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

          <div className="flex justify-between">
            <span className="text-muted-foreground">Created at:</span>
            <span className="font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

        </div>
      </Card>
    </main>
  )
}
