import { Loader2 } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shadcn/components/ui/card"
import { Skeleton } from "@/shadcn/components/ui/skeleton"

export function LoadingDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estados de carga</CardTitle>
        <CardDescription>
          Ejemplo del spinner y el skeleton disponibles en el toolkit de
          shadcn/ui.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8 md:flex-row">
        <div className="flex flex-1 flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="font-medium">Spinner</p>
            <p className="text-sm text-muted-foreground">
              Úsalo para indicar que estamos esperando datos.
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <div className="space-y-2">
            <p className="font-medium">Skeleton</p>
            <p className="text-sm text-muted-foreground">
              Útil para reservar el espacio del contenido mientras carga.
            </p>
          </div>
          <div className="space-y-4 rounded-lg border bg-muted/30 p-6">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 flex-1 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
