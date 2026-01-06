import { Skeleton } from "@/shadcn/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/shadcn/components/ui/card"

export default function Loading() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-6">
      <Skeleton className="h-10 w-48 mb-8" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-6">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
