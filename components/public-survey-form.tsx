"use client"

import { useEffect, useState } from "react"
import { submitResponse } from "@/lib/actions/responses"


type Question = {
  id: string
  type: string
  label: string
  help_text: string | null
  placeholder: string | null
  is_required: boolean
  question_options: { label: string; value: string }[]
}

export default function PublicSurveyForm({
  surveyId,
  slug,
  questions,
  thankYouMessage,
}: {
  surveyId: string
  slug: string
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

  useEffect(() => {
    if (done) {
      window.parent.postMessage({ type: "aseduis-survey-scroll-top", slug }, "*")
    }
  }, [done, slug])

  if (done) {
    return (
      <div className="card mt-10 px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg text-white">
          ✓
        </div>
        <h2 className="font-serif text-xl font-semibold text-ink">¡Gracias por responder!</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {thankYouMessage || "Tu respuesta ha sido registrada."}
        </p>
      </div>
    )
  }


  return (
    <form action={handleSubmit} className="mt-8 space-y-5">
      {questions.map((q) =>
        q.type === "section" ? (
          <div key={q.id} className="pt-2 first:pt-0">
            <h2 className="font-serif text-lg font-semibold text-ink">{q.label}</h2>
            {q.help_text && <p className="mt-1 text-sm text-muted">{q.help_text}</p>}
            <div className="mt-3 h-px bg-line" />
          </div>
        ) : (
          <div key={q.id} className="card p-5">
            <div className="mb-1 flex items-baseline gap-2">
              <label className="text-[15px] font-medium leading-snug text-ink">
                {q.label} {q.is_required && <span className="text-danger">*</span>}
              </label>
            </div>
            {q.help_text && <p className="mb-2 ml-6 text-xs text-muted">{q.help_text}</p>}
            <div className="ml-6">
              <QuestionInput question={q} />
            </div>
          </div>
        )
      )}

      {error && (
        <p className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full rounded-full py-3.5 text-sm font-medium"
      >
        {loading ? "Enviando…" : "Enviar respuesta"}
      </button>
    </form>
  )
}

function Chips({
  name, options, type, required, pad = "px-4 py-2",
}: {
  name: string
  options: { label: string; value: string }[]
  type: "radio" | "checkbox"
  required?: boolean
  pad?: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input type={type} name={name} value={o.value} required={required} className="peer sr-only" />
          <span className={`chip ${pad}`}>{o.label}</span>
        </label>
      ))}
    </div>
  )
}

function QuestionInput({ question: q }: { question: Question }) {
  const name = `q_${q.id}`
  const ph = q.placeholder ?? undefined

  switch (q.type) {
    case "short_text": case "email": case "phone":
      return <input name={name} type={q.type === "email" ? "email" : "text"} className="input" required={q.is_required} placeholder={ph} />
    case "long_text":
      return <textarea name={name} className="input" rows={4} required={q.is_required} placeholder={ph} />
    case "number":
      return <input name={name} type="number" className="input" required={q.is_required} placeholder={ph} />
    case "date":
      return <input name={name} type="date" className="input" required={q.is_required} />
    case "time":
      return <input name={name} type="time" className="input" required={q.is_required} />

    case "radio":
      return <Chips name={name} type="radio" options={q.question_options} required={q.is_required} />
    case "checkbox":
      return <Chips name={name} type="checkbox" options={q.question_options} />

    case "dropdown":
      return (
        <select name={name} className="input" required={q.is_required} defaultValue="">
          <option value="" disabled>Selecciona una opción</option>
          {q.question_options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )

    case "yes_no":
      return (
        <Chips
          name={name} type="radio" required={q.is_required} pad="px-5 py-2"
          options={[{ value: "yes", label: "Sí" }, { value: "no", label: "No" }]}
        />
      )

    case "scale_1_5": case "scale_custom":
      return (
        <Chips
          name={name} type="radio" required={q.is_required} pad="h-10 w-10"
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
        />
      )

    case "rating_stars":
      return (
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name={name} value={n} className="peer sr-only" required={q.is_required} />
              <span className="star">★</span>
            </label>
          ))}
        </div>
      )

    default:
      return <input name={name} className="input" required={q.is_required} />
  }
}