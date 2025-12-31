'use client'

import { Button } from "@/shadcn/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { Input } from "@/shadcn/components/ui/input"
import { Label } from "@/shadcn/components/ui/label"
import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { signup } from "@/app/actions/auth"
import { NotificationPreferences } from "./notificationPreferences"

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signup, null)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    if (state?.success && state?.userId && state?.email) {
      setShowPreferences(true)
    }
  }, [state])

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      {showPreferences && state?.userId && state?.email && (
        <NotificationPreferences 
          userId={state.userId}
          email={state.email}
          onClose={() => setShowPreferences(false)}
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
              <Input
                id="password"
                name="password"
                type="password"
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
