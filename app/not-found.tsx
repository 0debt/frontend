import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Link } from 'next-view-transitions'

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-24">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">
            Page not found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">Go back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

