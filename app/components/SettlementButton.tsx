'use client'

import { createSettlement } from '@/app/actions/expenses'
import { formatCurrency } from '@/app/lib/expenses'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shadcn/components/ui/alert-dialog'
import { Button } from '@/shadcn/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type SettlementButtonProps = {
  groupId: string
  fromUserId: string
  toUserId: string
  amount: number
  fromUserName: string
  toUserName: string
}

export function SettlementButton({
  groupId,
  fromUserId,
  toUserId,
  amount,
  fromUserName,
  toUserName,
}: SettlementButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSettlement = () => {
    setError(null)
    startTransition(async () => {
      const result = await createSettlement(groupId, fromUserId, toUserId, amount)
      
      if (result?.error) {
        setError(result.error)
      } else {
        setIsDialogOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Mark as Paid
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Are you sure this payment has been made?</p>
                
                <div className="bg-muted rounded-lg p-4 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Payment details</p>
                  <p className="text-lg font-semibold text-foreground">
                    {fromUserName} → {toUserName}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(amount)}
                  </p>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <p className="text-sm text-muted-foreground text-center">
                  This will record the settlement and update the group balance.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSettlement}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}