"use client"

import { Link } from "next-view-transitions"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewGroupPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Il nome del gruppo è obbligatorio")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          // owner/members li gestisci lato backend con JWT oppure li aggiungi qui se richiesto
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Errore nella creazione del gruppo")
      }

      router.push("/groups")
    } catch (err: any) {
      setError(err.message || "Errore imprevisto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-xl">
      <Link href="/groups" className="underline opacity-70">
        ← Torna ai gruppi
      </Link>

      <h1 className="mt-4 text-2xl font-bold">Crea nuovo gruppo</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome del gruppo</label>
          <input
            className="mt-1 w-full rounded-lg border bg-transparent p-2"
            placeholder="Es. Viaggio Barcellona"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Descrizione (opzionale)
          </label>
          <textarea
            className="mt-1 w-full rounded-lg border bg-transparent p-2"
            placeholder="Descrizione del gruppo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border px-4 py-2 hover:bg-white/5 disabled:opacity-50"
        >
          {loading ? "Creazione..." : "Crea gruppo"}
        </button>
      </form>
    </main>
  )
}