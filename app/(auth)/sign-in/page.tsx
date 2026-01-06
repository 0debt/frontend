'use client'

import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Input } from '@/shadcn/components/ui/input'
import { PasswordInput } from '@/app/components/PasswordInput'
import { Label } from '@/shadcn/components/ui/label'
import Link from 'next/link'
import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function SignInPage() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <main className="flex flex-1 items-center justify-center p-24">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm">
              Do not have an account?{' '}
              <Link className="text-primary hover:underline" href="/sign-up">
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
