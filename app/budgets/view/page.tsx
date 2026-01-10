import { fetchWithAuth } from '@/app/lib/api'
import { isMockBudgetsEnabled as isMockEnabled, MOCK_BUDGETS, MOCK_BUDGET_STATUSES, Budget, BudgetStatus } from '@/app/lib/mock-data/budgets'
import { getGroup } from '@/app/lib/groups'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Badge } from '@/shadcn/components/ui/badge'
import { Progress } from '@/shadcn/components/ui/progress'
import { Button } from '@/shadcn/components/ui/button'
import { Link } from 'next-view-transitions'
import { ArrowLeft, Clock, Edit } from 'lucide-react'
import { notFound } from 'next/navigation'
import { DeleteBudgetButton } from '@/app/components/DeleteBudgetButton'
import Image from 'next/image'

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value)
  }

type Props = {
  searchParams: Promise<{ budgetId: string, groupId: string }>
}

async function getBudget(budgetId: string, groupId: string): Promise<Budget | null> {
  if (isMockEnabled) {
    return MOCK_BUDGETS.find(b => b._id === budgetId) || null
  }

  try {
    const res = await fetchWithAuth(`/v1/budgets/group/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    const budgets = data.budgets || []
    return budgets.find((b: Budget) => b._id === budgetId) || null
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

type ChartResult =
  | { type: 'success'; url: string }
  | { type: 'rate_limit'; plan: string; limit: number; resetAt: number }
  | { type: 'error' }

async function getChartUrl(budgetId: string): Promise<ChartResult> {
  if (isMockEnabled) {
    const url = 'https://quickchart.io/chart?c=' + encodeURIComponent(JSON.stringify({
      type: 'pie',
      data: {
        labels: ['Food', 'Transport', 'Other'],
        datasets: [{ 
          data: [80, 40, 30],
          backgroundColor: ['#2DD4BF', '#3B82F6', '#A855F7']
        }]
      },
      options: {
        legend: {
          labels: { fontColor: 'white' }
        },
        plugins: {
          datalabels: { color: 'white' }
        }
      }
    }))
    return { type: 'success', url }
  }

  try {
    const res = await fetchWithAuth(`/v1/budgets/${budgetId}/chart`, {
      cache: 'no-store',
    })

    if (res.status === 429) {
      const data = await res.json()
      return {
        type: 'rate_limit',
        plan: data.plan || 'FREE',
        limit: data.limit || 0,
        resetAt: data.resetAt || Date.now(),
      }
    }

    if (!res.ok) {
      return { type: 'error' }
    }

    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return { type: 'success', url: `data:image/png;base64,${base64}` }
  } catch (error) {
    console.error('Error fetching chart:', error)
    return { type: 'error' }
  }
}

export default async function BudgetDetailPage({ searchParams }: Props) {
  const { budgetId, groupId } = await searchParams
  
  if (!budgetId || !groupId) {
    notFound()
  }

  const budget = await getBudget(budgetId, groupId)

  if (!budget) {
    notFound()
  }

  const status = await getBudgetStatus(budgetId)
  const group = await getGroup(groupId)

  const chartResult = await getChartUrl(budgetId)
  const percentage = status ? Math.min((status.spent / status.limit) * 100, 100) : 0

  const getHealthBadgeVariant = (health?: BudgetStatus['health']) => {
    switch (health) {
      case 'OK': return 'default'
      case 'WARNING': return 'secondary'
      case 'OVERBUDGET': return 'destructive'
      default: return 'outline'
    }
  }

  const getProgressColor = (health?: BudgetStatus['health']) => {
    switch (health) {
      case 'OK': return 'bg-primary'
      case 'WARNING': return 'bg-secondary'
      case 'OVERBUDGET': return 'bg-destructive'
      default: return 'bg-primary'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/budgets?group=${groupId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{budget.category || 'General Budget'}</h1>
          <p className="mt-1 text-muted-foreground">
            {budget.period} • Created {new Date(budget.createdAt).toLocaleDateString('es-ES')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/budgets/edit?budgetId=${budgetId}&groupId=${groupId}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteBudgetButton budgetId={budgetId} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget status</CardTitle>
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
                      {formatCurrency(status.spent)} / {formatCurrency(status.limit)}
                    </span>
                  </div>
                  <Progress value={percentage} indicatorClassName={getProgressColor(status.health)} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Remaining: {formatCurrency(status.limit - status.spent)}</span>
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
            <CardTitle>Budget details</CardTitle>
            <CardDescription>Budget information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Group</span>
              <span className="text-sm font-medium">{group?.name || budget.groupId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Limit amount</span>
              <span className="text-sm font-medium">{formatCurrency(budget.limitAmount)}</span>
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
          <CardTitle>Spending chart</CardTitle>
          <CardDescription>Visual breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          {status && status.spent > 0 && chartResult.type === 'success' ? (
            <div className="flex justify-center">
              <Image
                src={chartResult.url}
                alt="Budget chart"
                width={500}
                height={300}
                className="rounded-lg"
                draggable={false}
              />
            </div>
          ) : chartResult.type === 'rate_limit' ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-amber-800 dark:text-amber-400">
                    Rate limit exceeded
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-500">
                    You&apos;ve used all {chartResult.limit} charts available for your {chartResult.plan} plan this month.
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-500">
                    Resets: {new Date(chartResult.resetAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/plans">Upgrade subscription</Link>
            </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data available to generate chart</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add expenses to this group to see spending breakdown
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
