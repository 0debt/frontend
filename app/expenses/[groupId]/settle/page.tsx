import { fetchWithAuth } from '@/app/lib/api'
import {
  BalanceResponse,
  formatCurrency,
  getUserAvatar,
  getUserName,
  isMockEnabled,
  MOCK_BALANCE,
  MOCK_USERS,
  UserInfo,
} from '@/app/lib/expenses'
import { Badge } from '@/shadcn/components/ui/badge'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'next-view-transitions'
import Image from 'next/image'

type Props = {
  params: Promise<{ groupId: string }>
}

async function getBalances(groupId: string): Promise<BalanceResponse | null> {
  if (isMockEnabled) {
    return MOCK_BALANCE
  }

  try {
    const res = await fetchWithAuth(`/balances/${groupId}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('Failed to fetch balances:', res.status)
      return null
    }

    const data = await res.json()
    return data.data || null
  } catch (error) {
    console.error('Error fetching balances:', error)
    return null
  }
}

async function getGroupMembers(groupId: string): Promise<UserInfo[]> {
  if (isMockEnabled) {
    return MOCK_USERS
  }

  try {
    const res = await fetchWithAuth(`/groups/${groupId}/members`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return MOCK_USERS
    }

    const data = await res.json()
    return data.members || MOCK_USERS
  } catch {
    return MOCK_USERS
  }
}

export default async function SettleUpPage({ params }: Props) {
  const { groupId } = await params
  const balanceData = await getBalances(groupId)
  const members = await getGroupMembers(groupId)

  if (!balanceData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Could not load balance information</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/expenses">Go back to expenses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { balances, payments } = balanceData

  // Separar usuarios por estado
  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > 0.01)
    .sort((a, b) => b[1] - a[1])
  
  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < -0.01)
    .sort((a, b) => a[1] - b[1])

  const settledUp = Object.entries(balances)
    .filter(([, amount]) => Math.abs(amount) <= 0.01)

  const allSettled = payments.length === 0

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Settle Up</h1>
          <p className="mt-1 text-muted-foreground">
            See who owes what and simplify debts
          </p>
        </div>
      </div>

      {/* Status Banner */}
      {allSettled ? (
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardContent className="flex items-center gap-4 py-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">
                All settled up! 🎉
              </p>
              <p className="text-sm text-green-600 dark:text-green-500">
                No pending debts in this group
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-4 py-6">
            <AlertCircle className="h-10 w-10 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-400">
                {payments.length} payment{payments.length !== 1 ? 's' : ''} needed
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-500">
                Simplified from all expenses
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balances Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Who gets paid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <span className="text-lg">💰</span>
              Gets Back
            </CardTitle>
            <CardDescription>People who are owed money</CardDescription>
          </CardHeader>
          <CardContent>
            {creditors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No one is owed money
              </p>
            ) : (
              <div className="space-y-3">
                {creditors.map(([userId, amount]) => (
                  <div key={userId} className="flex items-center gap-3">
                    <Image
                      src={getUserAvatar(userId, members)}
                      alt={getUserName(userId, members)}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{getUserName(userId, members)}</p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      +{formatCurrency(amount)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Who owes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <span className="text-lg">💸</span>
              Owes
            </CardTitle>
            <CardDescription>People who need to pay</CardDescription>
          </CardHeader>
          <CardContent>
            {debtors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No one owes money
              </p>
            ) : (
              <div className="space-y-3">
                {debtors.map(([userId, amount]) => (
                  <div key={userId} className="flex items-center gap-3">
                    <Image
                      src={getUserAvatar(userId, members)}
                      alt={getUserName(userId, members)}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{getUserName(userId, members)}</p>
                    </div>
                    <Badge variant="destructive">
                      {formatCurrency(amount)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settled Up Users */}
      {settledUp.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Settled Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {settledUp.map(([userId]) => (
                <div key={userId} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                  <Image
                    src={getUserAvatar(userId, members)}
                    alt={getUserName(userId, members)}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span className="text-sm">{getUserName(userId, members)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Payments */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Payments</CardTitle>
            <CardDescription>
              The simplest way to settle all debts ({payments.length} transaction{payments.length !== 1 ? 's' : ''})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  {/* From */}
                  <div className="flex items-center gap-2 flex-1">
                    <Image
                      src={getUserAvatar(payment.from, members)}
                      alt={getUserName(payment.from, members)}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium">{getUserName(payment.from, members)}</p>
                      <p className="text-xs text-muted-foreground">pays</p>
                    </div>
                  </div>

                  {/* Arrow and Amount */}
                  <div className="flex flex-col items-center">
                    <Badge variant="secondary" className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-1" />
                  </div>

                  {/* To */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="text-right">
                      <p className="font-medium">{getUserName(payment.to, members)}</p>
                      <p className="text-xs text-muted-foreground">receives</p>
                    </div>
                    <Image
                      src={getUserAvatar(payment.to, members)}
                      alt={getUserName(payment.to, members)}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href="/expenses">
            Back to Expenses
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/expenses/new?groupId=${groupId}`}>
            Add New Expense
          </Link>
        </Button>
      </div>
    </div>
  )
}
