import { fetchWithAuth } from "@/app/lib/api"
import { isMockAuthEnabled as isMockEnabled, MOCK_USER, updateMockPlan } from "@/app/lib/mock-data/auth";
import { getSession } from "@/app/lib/session"
import { Button } from "@/shadcn/components/ui/button"
import { Badge } from "@/shadcn/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { redirect } from "next/navigation"
import { logout } from "../actions/auth"
import { Check } from "lucide-react"

export async function changePlan(formData: FormData) {
  "use server"

  const plan = formData.get("plan") as string

  if (isMockEnabled) {
    updateMockPlan(plan)
    return redirect("/plans")
  }

  const userId = formData.get("userId") as string

  await fetchWithAuth(`/users/${userId}/plan`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  })

  // Hacer logout para que el usuario vuelva a iniciar sesión con el plan actualizado
  await logout()
  redirect("/sign-in")
}

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
    <main className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Pricing plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* FREE PLAN */}
        <Card className="border-primary/20 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl font-bold">Free</CardTitle>
            <CardDescription className="text-xs">Perfect to get started</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">€0</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Up to <strong>3 groups</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Up to <strong>5 members</strong> per group</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>50 expenses</strong> per group</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>2 charts</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>60 API requests</strong>/min</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Community support</span>
              </li>
            </ul>

            <form action={changePlan}>
              <input type="hidden" name="plan" value="FREE" />
              <input type="hidden" name="userId" value={user._id} />
              <Button
                className="w-full"
                variant={isCurrentPlan("FREE") ? "secondary" : "default"}
                disabled={isCurrentPlan("FREE")}
                type="submit"
              >
                {isCurrentPlan("FREE") ? "Current plan" : "Get started"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* PRO PLAN */}
        <Card className="border-primary shadow-lg transition-all duration-300 hover:scale-105 relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
            Popular
          </Badge>
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl font-bold">Pro</CardTitle>
            <CardDescription className="text-xs">For serious users</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">€9.99</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Unlimited groups</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Up to <strong>50 members</strong> per group</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Unlimited expenses</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>15 charts</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Custom avatar</strong> upload</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>1,000 API requests</strong>/min</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Email support</span>
              </li>
            </ul>

            <form action={changePlan}>
              <input type="hidden" name="plan" value="PRO" />
              <input type="hidden" name="userId" value={user._id} />
              <Button
                className="w-full"
                variant={isCurrentPlan("PRO") ? "secondary" : "default"}
                disabled={isCurrentPlan("PRO")}
                type="submit"
              >
                {isCurrentPlan("PRO") ? "Current plan" : "Upgrade to Pro"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ENTERPRISE PLAN */}
        <Card className="border-primary/50 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl font-bold">Enterprise</CardTitle>
            <CardDescription className="text-xs">For teams and organizations</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">€29.99</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Unlimited groups</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Unlimited members</strong> per group</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Unlimited expenses</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>50 charts</strong> per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Custom avatar</strong> upload</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm"><strong>5,000 API requests</strong>/min</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>

            <form action={changePlan}>
              <input type="hidden" name="plan" value="ENTERPRISE" />
              <input type="hidden" name="userId" value={user._id} />
              <Button
                className="w-full"
                variant={isCurrentPlan("ENTERPRISE") ? "secondary" : "default"}
                disabled={isCurrentPlan("ENTERPRISE")}
                type="submit"
              >
                {isCurrentPlan("ENTERPRISE") ? "Current plan" : "Upgrade to Enterprise"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Changing plans requires re-authentication to update your session.</p>
      </div>
    </main>
  )
}
