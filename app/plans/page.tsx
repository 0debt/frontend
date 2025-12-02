import { fetchWithAuth } from "@/app/lib/api"
import { isMockEnabled, MOCK_USER } from "@/app/lib/mock"
import { getSession } from "@/app/lib/session"
import { Button } from "@/shadcn/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { redirect } from "next/navigation"

export default async function PlansPage() {
  let user

  if (isMockEnabled) {
    user = MOCK_USER
  } else {
    const session = await getSession()

    if (!session) {
      redirect("/sign-in")
    }

    const res = await fetchWithAuth("/users/me", { cache: "no-store" })

    if (!res.ok) {
      redirect("/sign-in")
    }

    user = await res.json()
  }

  const isCurrentPlan = (plan: string) => user.plan === plan

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">Subscription Plans</h1>
        <p className="mt-2 text-muted-foreground">
          Choose the plan that best fits your needs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        <Card className="border-primary/20 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-center">Free</CardTitle>
            <CardDescription>Perfect to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2">
              <li>• Up to 2 groups</li>
              <li>• Unlimited expenses</li>
              <li>• No add-ons</li>
            </ul>

            <Button 
              className="w-full"
              variant={isCurrentPlan("FREE") ? "secondary" : "default"}
              disabled={isCurrentPlan("FREE")}
            >
              {isCurrentPlan("FREE") ? "Current Plan" : "Choose Free"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/40 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-center">Pro</CardTitle>
            <CardDescription>Boost your productivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2">
              <li>• Unlimited groups</li>
              <li>• Optional add-ons</li>
              <li>• Advanced balance calculations</li>
            </ul>

            <Button 
              className="w-full"
              variant={isCurrentPlan("PRO") ? "secondary" : "default"}
              disabled={isCurrentPlan("PRO")}
            >
              {isCurrentPlan("PRO") ? "Current Plan" : "Choose Pro"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/70 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-center">Enterprise</CardTitle>
            <CardDescription>For organizations and large teams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2">
              <li>• Everything in Pro</li>
              <li>• Priority support</li>
              <li>• Premium add-ons</li>
            </ul>

            <Button 
              className="w-full"
              variant={isCurrentPlan("ENTERPRISE") ? "secondary" : "default"}
              disabled={isCurrentPlan("ENTERPRISE")}
            >
              {isCurrentPlan("ENTERPRISE") ? "Current Plan" : "Choose Enterprise"}
            </Button>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
