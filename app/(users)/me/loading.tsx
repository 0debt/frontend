import { Skeleton } from "@/shadcn/components/ui/skeleton"
import { Card, CardHeader } from "@/shadcn/components/ui/card"

export default function Loading() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-6">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-1" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>

        <div className="p-6">
          <div className="flex justify-between items-start gap-6">
            <div className="space-y-4 flex-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>

            <Skeleton className="w-20 h-20 rounded-full" />
          </div>

          <div className="mt-8 flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </Card>
    </main>
  )
}
