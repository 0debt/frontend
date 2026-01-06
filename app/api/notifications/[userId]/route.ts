import { fetchWithAuth } from "@/app/lib/api"
import { isMockAuthEnabled as isMockEnabled } from "@/app/lib/mock-data/auth"
import { NextRequest } from "next/server"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params

  // ✅ In mock: we don't call the gateway, we return "no notification"
  if (isMockEnabled) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }

  const upstreamPath = `/notifications/${userId}`
  const res = await fetchWithAuth(upstreamPath)
  const body = await res.text()

  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  })
}