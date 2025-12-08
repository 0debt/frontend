import { fetchWithAuth } from '@/app/lib/api'
import { isMockEnabled, MOCK_BUDGETS, MOCK_BUDGET_STATUSES, Budget, BudgetStatus, MOCK_USER } from '@/app/lib/mock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Badge } from '@/shadcn/components/ui/badge'
import { Progress } from '@/shadcn/components/ui/progress'
import { Button } from '@/shadcn/components/ui/button'
import { Link } from 'next-view-transitions'
import { ArrowLeft, Edit } from 'lucide-react'
import { notFound } from 'next/navigation'
import { DeleteBudgetButton } from '@/app/components/DeleteBudgetButton'
import Image from 'next/image'

const formatEUR = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)

type Props = {
  params: Promise<{ id: string }>
}

async function getBudget(id: string): Promise<Budget | null> {
  if (isMockEnabled) {
    return MOCK_BUDGETS.find(b => b._id === id) || null
  }

  try {
    // We need to find the budget by searching through groups
    // For now, we'll use demo-group
    const res = await fetchWithAuth(`/v1/budgets/group/demo-group`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    const budget = data.budgets?.find((b: Budget) => b._id === id)
    return budget || null
  } catch (error) {
    console.error('Error fetching budget:', error)
    return null
  }
}

async function getBudgetStatus(budgetId: string): Promise<BudgetStatus | null> {
  if (isMockEnabled) {
    return MOCK_BUDGET_STATUSES[budgetId] || null
  }

  try {
    const res = await fetchWithAuth(`/v1/budgets/${budgetId}/status`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    return await res.json()
  } catch (error) {
    console.error('Error fetching budget status:', error)
    return null
  }
}

async function getChartUrl(budgetId: string): Promise<string | null> {
  if (isMockEnabled) {
    return 'https://quickchart.io/chart?c=' + encodeURIComponent(JSON.stringify({
      type: 'pie',
      data: {
        labels: ['Food', 'Transport', 'Other'],
        datasets: [{ data: [80, 40, 30] }]
      }
    }))
  }

  try {
    const res = await fetchWithAuth(`/v1/budgets/${budgetId}/chart`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    // Backend now returns the image (png). Convert to data URL for rendering.
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error('Error fetching chart:', error)
    return null
  }
}

export default async function BudgetDetailPage({ params }: Props) {
  const { id } = await params
  const budget = await getBudget(id)

  if (!budget) {
    notFound()
  }

  const status = await getBudgetStatus(id)

  // Obtener plan del usuario
  let userPlan = 'FREE'
  if (isMockEnabled) {
    userPlan = MOCK_USER.plan || 'FREE'
  } else {
    try {
      const res = await fetchWithAuth('/users/me', { cache: 'no-store' })
      if (res.ok) {
        const me = await res.json()
        userPlan = (me?.plan || 'FREE').toUpperCase()
      }
    } catch (error) {
      console.error('Error fetching user plan:', error)
    }
  }

  const canViewChart = userPlan === 'PRO' || userPlan === 'ENTERPRISE'
  const chartUrl = canViewChart ? await getChartUrl(id) : null

  const percentage = status ? Math.min((status.spent / status.limit) * 100, 100) : 0

  const getHealthBadgeVariant = (health?: BudgetStatus['health']) => {
    switch (health) {
      case 'OK':
        return 'default'
      case 'WARNING':
        return 'secondary'
      case 'OVERBUDGET':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/budgets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{budget.category || 'General Budget'}</h1>
          <p className="mt-1 text-muted-foreground">
            {budget.period} • Created {new Date(budget.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/budgets/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteBudgetButton budgetId={id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget Status</CardTitle>
            <CardDescription>Current spending vs limit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Health</span>
                  <Badge variant={getHealthBadgeVariant(status.health)}>
                    {status.health}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-medium">
                      {formatEUR(status.spent)} / {formatEUR(status.limit)}
                    </span>
                  </div>
                  <Progress value={percentage} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Remaining: {formatEUR(status.limit - status.spent)}</span>
                    <span>{percentage.toFixed(1)}% used</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Status unavailable</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Details</CardTitle>
            <CardDescription>Budget information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Group</span>
              <span className="text-sm font-medium">{budget.groupId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Limit Amount</span>
              <span className="text-sm font-medium">{formatEUR(budget.limitAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Period</span>
              <span className="text-sm font-medium capitalize">{budget.period}</span>
            </div>
            {budget.category && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="text-sm font-medium">{budget.category}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending Chart</CardTitle>
          <CardDescription>Visual breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          {canViewChart ? (
            chartUrl ? (
              <div className="flex justify-center">
                <Image
                  src={chartUrl}
                  alt="Budget chart"
                  width={500}
                  height={300}
                  className="rounded-lg"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chart unavailable</p>
            )
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Charts are available on PRO or ENTERPRISE plans.
              </p>
              <Button asChild variant="default">
                <Link href="/plans">Upgrade to Pro</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




