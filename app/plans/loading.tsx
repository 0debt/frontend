import { Skeleton } from "@/shadcn/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/shadcn/components/ui/card"

export default function Loading() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 text-center">
        <Skeleton className="h-9 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className={i === 1 ? "border-primary shadow-lg" : ""}>
            <CardHeader className="text-center pb-3">
              <Skeleton className="h-7 w-24 mx-auto mb-1" />
              <Skeleton className="h-4 w-32 mx-auto mb-4" />
              <div className="mt-2 flex items-center justify-center">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-5 w-12 ml-1" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
