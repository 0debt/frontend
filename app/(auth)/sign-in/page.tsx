import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Input } from '@/shadcn/components/ui/input'
import { Label } from '@/shadcn/components/ui/label'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-24">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
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

