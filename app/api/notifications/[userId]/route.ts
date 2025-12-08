import { fetchWithAuth } from '@/app/lib/api'
import { NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params
  const upstreamPath = `/notifications/${userId}`

  const res = await fetchWithAuth(upstreamPath)
  const body = await res.text()

  return new Response(body, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') || 'application/json',
    },
  })
}

