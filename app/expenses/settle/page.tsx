import { SettlementButton } from '@/app/components/SettlementButton'
import { fetchWithAuth } from '@/app/lib/api'
import {
  BalanceResponse,
  formatCurrency,
  getUserAvatar,
  getUserName,
  UserInfo,
} from '@/app/lib/expenses'
import { isMockExpensesEnabled, MOCK_BALANCE, MOCK_USERS } from '@/app/lib/mock-data/expenses'
import { getUsersByIds } from '@/app/lib/users'
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar'
import { Badge } from '@/shadcn/components/ui/badge'
import { Button } from '@/shadcn/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Plus } from 'lucide-react'
import { Link } from 'next-view-transitions'

type Props = {
  searchParams: Promise<{ group?: string }>
}

async function getBalances(groupId: string): Promise<BalanceResponse | null> {
  if (isMockExpensesEnabled) {
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
  if (isMockExpensesEnabled) {
    return MOCK_USERS
  }

  try {
    const res = await fetchWithAuth(`/groups/${groupId}/summary`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    const memberIds = data.members || []

    if (memberIds.length === 0) return []

    return await getUsersByIds(memberIds)
  } catch (error) {
    console.error('Error fetching group members:', error)
    return []
  }
}

export default async function SettleUpPage({ searchParams }: Props) {
  const { group: groupId } = await searchParams

  if (!groupId) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No group selected</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/expenses">Go back to expenses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/expenses?group=${groupId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settle up</h1>
            <p className="text-muted-foreground">
              Simplify debts and square accounts
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/expenses/new?groupId=${groupId}`}>
            <Plus className="mr-2 h-4 w-4" />
            Add expense
          </Link>
        </Button>
      </div>

      {/* Status Banner */}
      {allSettled ? (
        <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-primary">
                All settled up! 🎉
              </p>
              <p className="text-sm text-primary/70">
                No pending debts in this group. Everyone is even.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/20 bg-amber-500/5 shadow-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle className="h-24 w-24" />
          </div>
          <CardContent className="flex items-center gap-6 py-8 relative">
            <div className="bg-amber-500/10 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-700">
                {payments.length} payment{payments.length !== 1 ? 's' : ''} pending
              </p>
              <p className="text-amber-600/80">
                Debts have been simplified to the minimum number of transactions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balances Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Who gets paid */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">
                  <ArrowRight className="h-4 w-4 text-green-600 -rotate-45" />
                </div>
                Gets Back
              </CardTitle>
              <Badge variant="outline" className="font-normal border-green-200 text-green-600 bg-green-50 dark:bg-green-900/10">
                Creditors
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-40">
            {creditors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No one is owed money</p>
            ) : (
              <div className="space-y-5 w-full">
                {creditors.map(([userId, amount]) => (
                  <div key={userId} className="flex items-center gap-4 group">
                    <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-green-100 dark:ring-green-900/20">
                      <AvatarImage src={getUserAvatar(userId, members)} alt={getUserName(userId, members)} />
                      <AvatarFallback>{getUserName(userId, members)[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{getUserName(userId, members)}</p>
                      <p className="text-xs text-muted-foreground">Total to receive</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Who owes */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-lg">
                  <ArrowRight className="h-4 w-4 text-red-600 rotate-135" />
                </div>
                Owes
              </CardTitle>
              <Badge variant="outline" className="font-normal border-red-200 text-red-600 bg-red-50 dark:bg-red-900/10">
                Debtors
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-40">
            {debtors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No one owes money</p>
            ) : (
              <div className="space-y-5 w-full">
                {debtors.map(([userId, amount]) => (
                  <div key={userId} className="flex items-center gap-4 group">
                    <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-red-100 dark:ring-red-900/20">
                      <AvatarImage src={getUserAvatar(userId, members)} alt={getUserName(userId, members)} />
                      <AvatarFallback>{getUserName(userId, members)[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{getUserName(userId, members)}</p>
                      <p className="text-xs text-muted-foreground">Total to pay</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(Math.abs(amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggested Payments */}
      {payments.length > 0 && (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold tracking-tight">Suggested payments</h2>
          <Badge variant="secondary" className="font-medium bg-muted text-muted-foreground">
            {payments.length} Transaction{payments.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="grid gap-4">
          {payments.map((payment, index) => (
            <Card key={index} className="overflow-hidden shadow-none border-border/60 hover:border-primary/30 transition-colors">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                  {/* Debtor */}
                  <div className="flex-1 p-5 flex items-center gap-4 bg-red-50/30 dark:bg-red-900/5">
                    <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-sm">
                      <AvatarImage src={getUserAvatar(payment.from, members)} alt={getUserName(payment.from, members)} />
                      <AvatarFallback>{getUserName(payment.from, members)[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground font-medium mb-0.5">Pays</p>
                      <p className="font-bold truncate text-base">{getUserName(payment.from, members)}</p>
                    </div>
                  </div>

                  {/* Transfer Info */}
                  <div className="flex sm:flex-col items-center justify-center gap-3 p-4 sm:p-2 bg-muted/20 sm:bg-transparent border-y sm:border-y-0 sm:border-x border-border/40 min-w-35">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-sm">
                      <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-primary">{formatCurrency(payment.amount)}</p>
                    </div>
                  </div>

                  {/* Creditor */}
                  <div className="flex-1 p-5 flex items-center gap-4 bg-green-50/30 dark:bg-green-900/5 sm:justify-end">
                    <div className="min-w-0 sm:text-right">
                      <p className="text-sm text-muted-foreground font-medium mb-0.5">To</p>
                      <p className="font-bold truncate text-base">{getUserName(payment.to, members)}</p>
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-sm order-first sm:order-last">
                      <AvatarImage src={getUserAvatar(payment.to, members)} alt={getUserName(payment.to, members)} />
                      <AvatarFallback>{getUserName(payment.to, members)[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Mark as Paid Button */}
                  <div className="p-4 flex items-center justify-center border-t sm:border-t-0 sm:border-l border-border/40">
                    <SettlementButton
                      groupId={groupId}
                      fromUserId={payment.from}
                      toUserId={payment.to}
                      amount={payment.amount}
                      fromUserName={getUserName(payment.from, members)}
                      toUserName={getUserName(payment.to, members)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      )}

      {/* Settled Up Users (Subtle list) */}
      {settledUp.length > 0 && (
        <div className="pt-4 border-t border-border/40">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Already Settled</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {settledUp.map(([userId]) => (
              <Badge key={userId} variant="secondary" className="pl-1 pr-3 py-1 bg-muted/50 text-muted-foreground font-medium border-none rounded-full flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={getUserAvatar(userId, members)} alt={getUserName(userId, members)} />
                  <AvatarFallback className="text-[10px]">{getUserName(userId, members)[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                {getUserName(userId, members)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}