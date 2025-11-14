"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shadcn/components/ui/card"
import { ScrollArea } from "@/shadcn/components/ui/scroll-area"

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `Item ${i + 1} de ${a.length}`
)

export function ScrollAreaDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Área de Scroll</CardTitle>
        <CardDescription>
          Ejemplo del componente ScrollArea para contenido con desplazamiento personalizado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 rounded-md border">
          <div className="p-4">
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="rounded-md border bg-primary/10 px-3 py-2 text-sm text-primary"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
