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
        <Input
          type="file"
          accept="image/*"
          className="h-11"
          onChange={(e) => {
            fileRef.current = e.target.files?.[0] || null
          }}
        />
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
