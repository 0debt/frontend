import { Card, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          View your financial analytics and insights
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Debt</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Monthly Payment</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Progress</CardDescription>
            <CardTitle className="text-2xl">100%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Time Remaining</CardDescription>
            <CardTitle className="text-2xl">0 days</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

