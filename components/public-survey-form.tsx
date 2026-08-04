"use client"

import { useState } from "react"
import { submitResponse } from "@/lib/actions/responses"

type Question = {
  id: string
  type: string
  label: string
  help_text: string | null
  is_required: boolean
  question_options: { label: string; value: string }[]
}

export default function PublicSurveyForm({
  surveyId,
  questions,
  thankYouMessage,
}: {
  surveyId: string
  questions: Question[]
  thankYouMessage: string | null
}) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    const result = await submitResponse(surveyId, formData)
    setLoading(false)
    if (result.error) return setError(result.error)
    setDone(true)
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h2 className="text-xl font-semibold">¡Gracias por responder!</h2>
        <p className="mt-2 text-gray-600">{thankYouMessage || "Tu respuesta ha sido registrada."}</p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="mx-auto max-w-lg space-y-6 py-10">
      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-medium">
            {q.label} {q.is_required && <span className="text-red-500">*</span>}
          </label>
          {q.help_text && <p className="mb-1 text-xs text-gray-500">{q.help_text}</p>}
          <QuestionInput question={q} />
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit" disabled={loading}
        className="w-full rounded bg-black py-3 text-white disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  )
}

function QuestionInput({ question: q }: { question: Question }) {
  const name = `q_${q.id}`
  const base = "mt-1 w-full rounded border px-3 py-2"

  switch (q.type) {
    case "short_text": case "email": case "phone":
      return <input name={name} type={q.type === "email" ? "email" : "text"} className={base} required={q.is_required} />
    case "long_text":
      return <textarea name={name} className={base} rows={4} required={q.is_required} />
    case "number":
      return <input name={name} type="number" className={base} required={q.is_required} />
    case "date":
      return <input name={name} type="date" className={base} required={q.is_required} />
    case "time":
      return <input name={name} type="time" className={base} required={q.is_required} />
    case "radio":
      return (
        <div className="mt-1 space-y-1">
          {q.question_options.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm">
              <input type="radio" name={name} value={o.value} required={q.is_required} /> {o.label}
            </label>
          ))}
        </div>
      )
    case "dropdown":
      return (
        <select name={name} className={base} required={q.is_required} defaultValue="">
          <option value="" disabled>Selecciona una opción</option>
          {q.question_options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    case "checkbox":
      return (
        <div className="mt-1 space-y-1">
          {q.question_options.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={name} value={o.value} /> {o.label}
            </label>
          ))}
        </div>
      )
    case "yes_no":
      return (
        <div className="mt-1 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name={name} value="yes" required={q.is_required} /> Sí
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name={name} value="no" required={q.is_required} /> No
          </label>
        </div>
      )
    case "scale_1_5": case "scale_custom":
      return (
        <div className="mt-1 flex gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="flex flex-col items-center text-xs">
              <input type="radio" name={name} value={n} required={q.is_required} />
              {n}
            </label>
          ))}
        </div>
      )
    case "rating_stars":
      return (
        <div className="mt-1 flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n}>
              <input type="radio" name={name} value={n} className="hidden peer" required={q.is_required} />
              <span className="cursor-pointer peer-checked:text-yellow-400 text-gray-300">★</span>
            </label>
          ))}
        </div>
      )
    default:
      return <input name={name} className={base} required={q.is_required} />
  }
}