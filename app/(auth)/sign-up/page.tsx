'use client'

import { Button } from "@/shadcn/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { Input } from "@/shadcn/components/ui/input"
import { PasswordInput } from "@/app/components/PasswordInput"
import { Label } from "@/shadcn/components/ui/label"
import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { signup } from "@/app/actions/auth"
import { NotificationPreferencesModal } from "@/app/components/NotificationPreferencesModal"

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signup, null)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    if (state?.success && state?.userId && state?.email) {
      const t = setTimeout(() => setShowPreferences(true), 0)
      return () => clearTimeout(t)
    }
  }, [state])

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      {showPreferences && state?.userId && state?.email && (
        <NotificationPreferencesModal 
          userId={state.userId}
          email={state.email}
          isOpen={true}
          onClose={() => setShowPreferences(false)}
          mode="onboarding"
        />
      )}
      
      {!showPreferences && (
      <Card className="w-full max-w-md border-none shadow-none">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-semibold">Create your account</CardTitle>
          <CardDescription>
            Join 0debt in just a few seconds.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={action} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                className="h-12 text-base"
                required
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={pending}>
              {pending ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      )}
    </main>
  )
}
