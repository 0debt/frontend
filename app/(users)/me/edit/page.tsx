import { fetchWithAuth } from "@/app/lib/api";
import { isMockAuthEnabled as isMockEnabled, MOCK_USER } from "@/app/lib/mock-data/auth";

import { getSession } from "@/app/lib/session";
import { Card } from "@/shadcn/components/ui/card";
import { redirect } from "next/navigation";
import EditProfileForm from "./edit-profile-form";

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
      throw new Error("Failed to load profile")
    }

    user = await res.json()
  }

  return (
    <main className="container mx-auto max-w-xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your personal information.
        </p>
      </div>
      <Card>
        <EditProfileForm user={user} />
      </Card>
    </main>
  )
}
