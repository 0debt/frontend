import { BudgetForm } from '@/app/components/BudgetForm'
import { Button } from '@/shadcn/components/ui/button'
import { Link } from 'next-view-transitions'
import { ArrowLeft } from 'lucide-react'

export default function NewBudgetPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/budgets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Budget</h1>
          <p className="mt-1 text-muted-foreground">
            Set up a new budget to track your spending
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <BudgetForm mode="create" />
        </div>
      </div>
    </div>
  )
}




