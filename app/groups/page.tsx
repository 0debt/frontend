import { fetchWithAuth } from "@/app/lib/api"
import { isMockEnabled } from "@/app/lib/mock"
import { getSession } from "@/app/lib/session"
import { Link } from "next-view-transitions"
import { redirect } from "next/navigation"

type Group = {
  _id?: string
  id?: string
  name: string
  members?: string[]
}

const MOCK_GROUPS: Group[] = [
  { id: "1", name: "Viaggio a Roma" },
  { id: "2", name: "Casa Milano" },
]

export default async function GroupsPage() {
  // ✅ MOCK
  if (isMockEnabled) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Groups – group-services</h1>
        <p className="opacity-70">Mock mode</p>

        <div className="mt-6 space-y-3">
          {MOCK_GROUPS.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="block rounded-xl border p-4 hover:bg-white/5"
            >
              <div className="font-semibold">{g.name}</div>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/groups/new" className="underline">
            + Crea nuovo gruppo
          </Link>
        </div>
      </main>
    )
  }

  // ✅ REAL (quando backend/gateway è su)
  const session = await getSession()
  if (!session) redirect("/sign-in")

  // Backend: GET /visualization?name=...
  const res = await fetchWithAuth(
    `/groups/visualization?name=${encodeURIComponent(session.sub)}`
  )
  if (!res.ok) throw new Error("Failed to load groups")
  const groups: Group[] = await res.json()

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Groups – group-services</h1>

      <div className="mt-6 space-y-3">
        {groups.map((g) => {
          const id = g.id || g._id || ""
          return (
            <Link
              key={id}
              href={`/groups/${id}`}
              className="block rounded-xl border p-4 hover:bg-white/5"
            >
              <div className="font-semibold">{g.name}</div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}