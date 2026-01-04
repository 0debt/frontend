"use client"

import { useState } from "react"

type Props = {
  groupId: string
  initialName?: string
  initialDescription?: string
}

export function EditGroupForm({ groupId, initialName = "", initialDescription = "" }: Props) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function onSave() {
    setMsg(null)
    setLoading(true)
    try {
      const res = await fetch("/api/groups/update-details", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          groupId,
          name: name.trim() || undefined,
          description: description.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Errore salvataggio")
      }

      setMsg("Salvato ✅ (se mock, è solo simulato)")
      // semplice refresh della pagina (server component)
      window.location.reload()
    } catch (e: any) {
      setMsg(e.message || "Errore")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-6 rounded-xl border p-4">
      <h2 className="font-semibold">Modifica gruppo</h2>

      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-sm opacity-70">Nome</label>
          <input
            className="mt-1 w-full rounded-lg border bg-transparent p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm opacity-70">Descrizione</label>
          <textarea
            className="mt-1 w-full rounded-lg border bg-transparent p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        {msg && <p className="text-sm opacity-80">{msg}</p>}

        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="rounded-lg border px-4 py-2 hover:bg-white/5 disabled:opacity-50"
        >
          {loading ? "Salvo..." : "Salva"}
        </button>
      </div>
    </section>
  )
}