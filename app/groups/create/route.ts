import { fetchWithAuth } from "@/app/lib/api"
import { isMockEnabled } from "@/app/lib/mock"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  // ✅ MOCK: non chiamare backend
  if (isMockEnabled) {
    return NextResponse.json({ ok: true, mock: true }, { status: 200 })
  }

  const body = await req.json()

  const res = await fetchWithAuth("/groups/creation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  })
}