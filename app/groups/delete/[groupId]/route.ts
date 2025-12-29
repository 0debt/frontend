import { fetchWithAuth } from "@/app/lib/api"
import { isMockEnabled } from "@/app/lib/mock"
import { NextResponse } from "next/server"

export async function DELETE(
  _req: Request,
  { params }: { params: { groupId: string } }
) {
  if (isMockEnabled) {
    return NextResponse.json({ ok: true, mock: true }, { status: 200 })
  }

  const res = await fetchWithAuth(`/groups/${params.groupId}`, {
    method: "DELETE",
  })

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  })
}