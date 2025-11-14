"use client"

import { Button } from "@/shadcn/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shadcn/components/ui/card"
import { toast } from "sonner"

export function SonnerDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones Toast (Sonner)</CardTitle>
        <CardDescription>
          Ejemplo del componente Sonner para mostrar notificaciones tipo toast.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button
          onClick={() =>
            toast("Click me", {
              description: "¡Has clickeado el botón!",
            })
          }
        >
          Click me
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Operación exitosa", {
              description: "Todo salió bien.",
            })
          }
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Error", {
              description: "Algo salió mal.",
            })
          }
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning("Advertencia", {
              description: "Ten cuidado con esto.",
            })
          }
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.info("Información", {
              description: "Aquí hay información útil.",
            })
          }
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const promise = () =>
              new Promise<{ name: string }>((resolve) => setTimeout(() => resolve({ name: "Sonner" }), 2000))

            toast.promise(promise, {
              loading: "Cargando...",
              success: (data) => {
                return `${data.name} ha sido cargado`
              },
              error: "Error",
            })
          }}
        >
          Promise
        </Button>
      </CardContent>
    </Card>
  )
}
