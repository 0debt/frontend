import { fetchWithAuth } from "@/app/lib/api"
import { isMockEnabled, MOCK_USER, updateMockPlan } from "@/app/lib/mock"
import { getSession } from "@/app/lib/session"
import { Button } from "@/shadcn/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shadcn/components/ui/card"
import { redirect } from "next/navigation"


export async function changePlan(formData: FormData) {
  "use server"

  const plan = formData.get("plan") as string
  //Para cambiar el plan en modo mock
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

  redirect("/plans")
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
              <li>• Caracteristicas Plan Free</li>
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
                {isCurrentPlan("FREE") ? "Current Plan" : "Choose Free"}
              </Button>
            </form>

          </CardContent>
        </Card>

        <Card className="border-primary/40 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-center">Pro</CardTitle>
            <CardDescription>Boost your productivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2">
              <li>• Caracteristicas Plan Pro</li>
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
                {isCurrentPlan("PRO") ? "Current Plan" : "Choose Pro"}
              </Button>
            </form>

          </CardContent>
        </Card>

        <Card className="border-primary/70 transition-all duration-300 hover:scale-105">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-center">Enterprise</CardTitle>
            <CardDescription>For organizations and large teams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2">
              <li>• Caracteristicas Plan Enterprise</li>
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
                {isCurrentPlan("ENTERPRISE") ? "Current Plan" : "Choose Enterprise"}
              </Button>
            </form>

          </CardContent>
        </Card>

      </div>
    </main>
  )
}
