import { LoadingDemo } from '@/app/components/LoadingDemo'
import { ScrollAreaDemo } from '@/app/components/ScrollAreaDemo'
import { SonnerDemo } from '@/app/components/SonnerDemo'

export default function DemoComponentsPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Demo Components</h1>
        <p className="mt-2 text-muted-foreground">
          Ejemplos interactivos de los componentes de shadcn/ui disponibles en el proyecto
        </p>
      </div>

      <section className="space-y-8">
        <LoadingDemo />
        <SonnerDemo />
        <ScrollAreaDemo />
      </section>
    </main>
  )
}
