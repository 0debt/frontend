import { Skeleton } from "@/shadcn/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/shadcn/components/ui/card"
import { Button } from "@/shadcn/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function Loading() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-6">
      <Button variant="ghost" disabled className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to groups
      </Button>

      {/* Banner Image Skeleton */}
      <Skeleton className="w-full rounded-lg border shadow-sm aspect-[5/1] max-h-[200px] mb-8" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Members */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
