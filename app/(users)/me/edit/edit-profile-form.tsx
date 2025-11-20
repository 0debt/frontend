"use client"

import { Button } from "@/shadcn/components/ui/button"
import { Input } from "@/shadcn/components/ui/input"
import { Label } from "@/shadcn/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

type User = {
  name: string
  email: string
  plan: string
}

export default function EditProfileForm({
  user,
  mock,
}: {
  user: User
  mock: boolean
}) {
  const router = useRouter()

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mock) {
      router.push("/users/profile")
      return
    }

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    await fetch("https://api.0debt.xyz/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email }),
    })

    router.push("/users/profile")
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm">

      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          className="h-11"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          className="h-11"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full h-11 text-base">
        Save Changes
      </Button>

    </form>
  )
}
