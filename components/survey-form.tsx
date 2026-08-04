"use client"

import { useState } from "react"
import { slugify } from "@/lib/validations/survey"

type Survey = {
  id?: string
  title?: string
  description?: string | null
  cover_image_url?: string | null
  slug?: string
  start_date?: string | null
  end_date?: string | null
  thank_you_message?: string | null
  allow_duplicate_responses?: boolean
  is_public?: boolean
}

export default function SurveyForm({
  survey,
  action,
}: {
  survey?: Survey
  action: (formData: FormData) => Promise<{ error?: string } | void>
}) {
  const [title, setTitle] = useState(survey?.title ?? "")
  const [slug, setSlug] = useState(survey?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    const result = await action(formData)
    setLoading(false)
    if (result?.error) setError(result.error)
  }

  return (
    <form action={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium">Título</label>
        <input
          name="title" required value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Slug (URL)</label>
        <input
          name="slug" required value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
          className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          name="description" defaultValue={survey?.description ?? ""}
          className="mt-1 w-full rounded border px-3 py-2" rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Imagen de portada (URL)</label>
        <input
          name="cover_image_url" defaultValue={survey?.cover_image_url ?? ""}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Fecha de inicio</label>
          <input
            type="date" name="start_date"
            defaultValue={survey?.start_date?.slice(0, 10) ?? ""}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha de fin</label>
          <input
            type="date" name="end_date"
            defaultValue={survey?.end_date?.slice(0, 10) ?? ""}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Mensaje de agradecimiento</label>
        <textarea
          name="thank_you_message" defaultValue={survey?.thank_you_message ?? ""}
          className="mt-1 w-full rounded border px-3 py-2" rows={2}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox" name="allow_duplicate_responses"
            defaultChecked={survey?.allow_duplicate_responses ?? false}
          />
          Permitir respuestas duplicadas
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox" name="is_public"
            defaultChecked={survey?.is_public ?? true}
          />
          Encuesta pública
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit" disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  )
}