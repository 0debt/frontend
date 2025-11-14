import { Card, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'

import { LoadingDemo } from '@/app/components/LoadingDemo'
import { SonnerDemo } from '@/app/components/SonnerDemo'

export default function DocsPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Documentation</h1>
        <p className="mt-2 text-muted-foreground">
          Learn how to use 0debt to achieve financial freedom
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Welcome to 0debt! This guide will help you get started with the platform.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
            <CardDescription>
              Complete API reference documentation for 0debt.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guides</CardTitle>
            <CardDescription>
              Step-by-step guides to help you make the most of 0debt.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <section className="mt-12 space-y-8">
        <LoadingDemo />
        <SonnerDemo />
      </section>
    </main>
  )
}

