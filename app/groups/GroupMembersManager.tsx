"use client"

import { useState } from "react"

type Props = {
  groupId: string
  initialMembers: string[]
}

export function GroupMembersManager({ groupId, initialMembers }: Props) {
  const [members, setMembers] = useState<string[]>(initialMembers)
  const [emailToAdd, setEmailToAdd] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function addMember() {
    setMsg(null)
    const email = emailToAdd.trim()
    if (!email) return

    setLoading(true)
    try {
      const res = await fetch("/api/groups/update-member", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          groupId,
          members: [email, undefined], // [emailToAdd, memberToRemove]
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Errore aggiunta membro")
      }

      // MOCK: aggiorniamo UI localmente
      if (!members.includes(email)) setMembers((prev) => [...prev, email])

      setEmailToAdd("")
      setMsg("Membro aggiunto ✅ (se mock è simulato)")
    } catch (e: any) {
      setMsg(e.message || "Errore")
    } finally {
      setLoading(false)
    }
  }

  async function removeMember(memberIdOrEmail: string) {
    setMsg(null)
    setLoading(true)
    try {
      const res = await fetch("/api/groups/update-member", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          groupId,
          members: [undefined, memberIdOrEmail], // [emailToAdd, memberToRemove]
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Errore rimozione membro")
      }

      // MOCK: aggiorniamo UI localmente
      setMembers((prev) => prev.filter((m) => m !== memberIdOrEmail))

      setMsg("Membro rimosso ✅ (se mock è simulato)")
    } catch (e: any) {
      setMsg(e.message || "Errore")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-6 rounded-xl border p-4">
      <h2 className="font-semibold">Gestione membri</h2>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border bg-transparent p-2"
          placeholder="Email membro da aggiungere"
          value={emailToAdd}
          onChange={(e) => setEmailToAdd(e.target.value)}
          disabled={loading}
        />
        <button
          type="button"
          onClick={addMember}
          disabled={loading}
          className="rounded-lg border px-4 py-2 hover:bg-white/5 disabled:opacity-50"
        >
          Aggiungi
        </button>
      </div>

      {msg && <p className="mt-3 text-sm opacity-80">{msg}</p>}

      <ul className="mt-4 space-y-2">
        {members.map((m) => (
          <li key={m} className="flex items-center justify-between rounded-lg border p-2">
            <span className="text-sm">{m}</span>
            <button
              type="button"
              onClick={() => removeMember(m)}
              disabled={loading}
              className="rounded-lg border px-3 py-1 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Rimuovi
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}