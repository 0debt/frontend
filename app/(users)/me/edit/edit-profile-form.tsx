"use client"

import { updateProfile } from "@/app/actions/auth"
import { Button } from "@/shadcn/components/ui/button"
import { Input } from "@/shadcn/components/ui/input"
import { Label } from "@/shadcn/components/ui/label"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

type User = {
  _id: string
  name: string
  email: string
  plan: string
}

export default function EditProfileForm({ user }: { user: User }) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<File | null>(null)
  const canChangeAvatar = user.plan === "PRO" || user.plan === "ENTERPRISE"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set("id", user._id)
    formData.set("name", name)

    if (fileRef.current) {
      formData.set("avatar", fileRef.current)
    }

    const result = await updateProfile(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    router.refresh()
    router.push("/me")
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm">
      <div className="space-y-2">
        <Label>Avatar</Label>
        {canChangeAvatar ? (
          <Input
            type="file"
            accept="image/*"
            className="h-11"
            onChange={(e) => {
              fileRef.current = e.target.files?.[0] || null
            }}
          />

        ) : (
          <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-4">
            <div className="flex items-start gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Avatar no disponible en tu plan
                </p>

                <p className="text-xs text-muted-foreground">
                  La subida de avatar está disponible solo para planes PRO o ENTERPRISE.
                </p>

                <a
                  href="/plans"
                  className="inline-block text-xs font-medium text-primary underline underline-offset-4"
                >
                  Ver planes disponibles →
                </a>
              </div>
            </div>
          </div>

        )}
      </div>


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
          className="h-11 bg-muted"
          value={user.email}
          disabled
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
