"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  groupId: string
}

export function DeleteGroupButton({ groupId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onDelete() {
    const ok = window.confirm("Vuoi eliminare questo gruppo? Operazione irreversibile.")
    if (!ok) return

    setMsg(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/delete/${groupId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Errore eliminazione gruppo")
      }

      setMsg("Gruppo eliminato ✅ (se mock, è simulato)")
      router.push("/groups")
      router.refresh()
    } catch (e: any) {
      setMsg(e.message || "Errore")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-6 rounded-xl border p-4">
      <h2 className="font-semibold">Danger zone</h2>
      <p className="mt-1 text-sm opacity-70">
        Elimina il gruppo (solo owner).
      </p>

      {msg && <p className="mt-3 text-sm opacity-80">{msg}</p>}

      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="mt-3 rounded-lg border px-4 py-2 hover:bg-white/5 disabled:opacity-50"
      >
        {loading ? "Elimino..." : "Elimina gruppo"}
      </button>
    </section>
  )
}