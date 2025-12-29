import { fetchWithAuth } from "@/app/lib/api"
import { isMockEnabled } from "@/app/lib/mock"
import { Link } from "next-view-transitions"

type Props = { params: Promise<{ groupId: string }> }

type GroupSummary = {
  groupId: string
  name: string
  description?: string
  members: string[]
  membersCount: number
  owner: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export default async function GroupDetailPage({ params }: Props) {
  const { groupId } = await params

  // ✅ MOCK
  if (isMockEnabled) {
    return (
      <main className="p-6">
        <Link href="/groups" className="underline opacity-70">
          ← Torna ai gruppi
        </Link>

        <h1 className="mt-4 text-2xl font-bold">Gruppo {groupId}</h1>

        <div className="mt-6 rounded-xl border p-4">
          <h2 className="font-semibold">Summary (mock)</h2>
          <p className="text-sm opacity-70">Totale speso: —</p>
          <p className="text-sm opacity-70">Membri: 3</p>
        </div>
      </main>
    )
  }

  // ✅ REAL (quando backend/gateway è su)
  const res = await fetchWithAuth(`/groups/${groupId}/summary`)
  if (!res.ok) throw new Error("Failed to load group summary")
  const summary: GroupSummary = await res.json()

  return (
    <main className="p-6">
      <Link href="/groups" className="underline opacity-70">
        ← Torna ai gruppi
      </Link>

      <h1 className="mt-4 text-2xl font-bold">{summary.name}</h1>
      {summary.description && <p className="opacity-70">{summary.description}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border p-4">
          <h2 className="font-semibold">Info</h2>
          <p className="text-sm opacity-70">Owner: {summary.owner}</p>
          <p className="text-sm opacity-70">Membri: {summary.membersCount}</p>
        </section>

        <section className="rounded-xl border p-4">
          <h2 className="font-semibold">Membri</h2>
          <ul className="mt-2 list-disc pl-5 text-sm opacity-80">
            {summary.members.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}