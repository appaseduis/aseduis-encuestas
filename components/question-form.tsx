"use client"

import { useState } from "react"
import { questionTypes, questionTypeLabels, typesWithOptions, typesWithPlaceholder } from "@/lib/validations/question"

type Question = {
  id?: string
  type?: string
  label?: string
  help_text?: string | null
  is_required?: boolean
  question_options?: { label: string }[]
}

export default function QuestionForm({
  question,
  action,
  onDone,
}: {
  question?: Question
  action: (formData: FormData) => Promise<{ error?: string } | void>
  onDone?: () => void
}) {
  const [type, setType] = useState(question?.type ?? "short_text")
  const [options, setOptions] = useState<string[]>(
    question?.question_options?.map((o) => o.label) ?? ["", ""]
  )
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    const result = await action(formData)
    setLoading(false)
    if (result?.error) return setError(result.error)
    onDone?.()
  }

  return (
    <form action={handleSubmit} className="space-y-3 rounded border bg-white p-4">
      <div>
        <label className="block text-sm font-medium">Tipo de pregunta</label>
        <select
          name="type" value={type} onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        >
          {questionTypes.map((t) => (
            <option key={t} value={t}>{questionTypeLabels[t]}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">
          {type === "section" ? "Texto de la sección" : "Pregunta"}
        </label>
        <input
          name="label" required defaultValue={question?.label ?? ""}
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder={type === "section" ? "Ej: Información del egresado" : ""}
        />
      </div>

      {type !== "section" && (
        <>
          <div>
            <label className="block text-sm font-medium">Texto de ayuda (opcional)</label>
            <input
              name="help_text" defaultValue={question?.help_text ?? ""}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          {typesWithPlaceholder.includes(type) && (
            <div>
              <label className="block text-sm font-medium">Ejemplo (dentro de la caja)</label>
              <input
                name="placeholder" defaultValue={question?.placeholder ?? ""}
                className="mt-1 w-full rounded border px-3 py-2"
                placeholder="Ej: Juan Pérez Gómez"
              />
            </div>
          )}
        </>
      )}

      {typesWithOptions.includes(type) && (
        <div>
          <label className="block text-sm font-medium">Opciones</label>
          {options.map((opt, i) => (
            <div key={i} className="mt-1 flex gap-2">
              <input
                name="option_label" defaultValue={opt}
                className="w-full rounded border px-3 py-2"
                placeholder={`Opción ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                className="text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOptions([...options, ""])}
            className="mt-2 text-sm text-blue-600"
          >
            + Agregar opción
          </button>
        </div>
      )}

      {type !== "section" && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_required" defaultChecked={question?.is_required ?? false} />
            Obligatoria
          </label>
        )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit" disabled={loading}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar pregunta"}
      </button>
    </form>
  )
}