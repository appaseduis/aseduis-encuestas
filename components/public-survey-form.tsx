"use client"

import { useState } from "react"
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
      <div className="mt-10 rounded-2xl border border-[#E7E0D2] bg-white px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B2A4A] text-lg text-[#FAF7EF]">
          ✓
        </div>
        <h2 className="font-serif text-xl font-semibold text-[#1B2A4A]">¡Gracias por responder!</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#5B5646]">
          {thankYouMessage || "Tu respuesta ha sido registrada."}
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-5">
      {questions.map((q, i) => (
        q.type === "section" ? (
          <div key={q.id} className="pt-2 first:pt-0">
            <h2 className="font-serif text-lg font-semibold text-[#1B2A4A]">{q.label}</h2>
            {q.help_text && <p className="mt-1 text-sm text-[#9C9280]">{q.help_text}</p>}
            <div className="mt-3 h-px bg-[#E7E0D2]" />
          </div>
        ) : (
          <div key={q.id} className="rounded-2xl border border-[#E7E0D2] bg-white p-5">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-serif text-xs font-semibold text-[#B98A2F]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <label className="text-[15px] font-medium leading-snug text-[#201C16]">
                {q.label} {q.is_required && <span className="text-[#B54B3B]">*</span>}
              </label>
            </div>
            {q.help_text && <p className="mb-2 ml-6 text-xs text-[#9C9280]">{q.help_text}</p>}
            <div className="ml-6">
              <QuestionInput question={q} />
            </div>
          </div>
        )
      ))}

      {error && (
        <p className="rounded-lg bg-[#FBEAE6] px-4 py-2.5 text-sm text-[#B54B3B]">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#1B2A4A] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#14213D] disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Enviar respuesta"}
      </button>
    </form>
  )
}

function QuestionInput({ question: q }: { question: Question }) {
  const name = `q_${q.id}`
  const inputClass =
    "mt-1 w-full rounded-lg border border-[#E7E0D2] bg-[#FDFCF8] px-3.5 py-2.5 text-[15px] text-[#201C16] outline-none transition-colors focus:border-[#1B2A4A]"

  switch (q.type) {
    case "short_text": case "email": case "phone":
      return <input name={name} type={q.type === "email" ? "email" : "text"} className={inputClass} required={q.is_required} placeholder={q.placeholder ?? undefined} />
    case "long_text":
      return <textarea name={name} className={inputClass} rows={4} required={q.is_required} placeholder={q.placeholder ?? undefined} />
    case "number":
      return <input name={name} type="number" className={inputClass} required={q.is_required} placeholder={q.placeholder ?? undefined} />
    case "date":
      return <input name={name} type="date" className={inputClass} required={q.is_required} placeholder={q.placeholder ?? undefined} />
    case "time":
      return <input name={name} type="time" className={inputClass} required={q.is_required} placeholder={q.placeholder ?? undefined} />

    case "radio":
      return (
        <div className="flex flex-wrap gap-2">
          {q.question_options.map((o) => (
            <label key={o.value} className="cursor-pointer">
              <input type="radio" name={name} value={o.value} required={q.is_required} className="peer sr-only" />
              <span className="inline-block rounded-full border border-[#E7E0D2] px-4 py-2 text-sm text-[#201C16] transition-colors peer-checked:border-[#1B2A4A] peer-checked:bg-[#1B2A4A] peer-checked:text-white">
                {o.label}
              </span>
            </label>
          ))}
        </div>
      )

    case "checkbox":
      return (
        <div className="flex flex-wrap gap-2">
          {q.question_options.map((o) => (
            <label key={o.value} className="cursor-pointer">
              <input type="checkbox" name={name} value={o.value} className="peer sr-only" />
              <span className="inline-block rounded-full border border-[#E7E0D2] px-4 py-2 text-sm text-[#201C16] transition-colors peer-checked:border-[#1B2A4A] peer-checked:bg-[#1B2A4A] peer-checked:text-white">
                {o.label}
              </span>
            </label>
          ))}
        </div>
      )

    case "dropdown":
      return (
        <select name={name} className={inputClass} required={q.is_required} defaultValue="">
          <option value="" disabled>Selecciona una opción</option>
          {q.question_options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )

    case "yes_no":
      return (
        <div className="flex gap-2">
          {[["yes", "Sí"], ["no", "No"]].map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name={name} value={value} required={q.is_required} className="peer sr-only" />
              <span className="inline-block rounded-full border border-[#E7E0D2] px-5 py-2 text-sm text-[#201C16] transition-colors peer-checked:border-[#1B2A4A] peer-checked:bg-[#1B2A4A] peer-checked:text-white">
                {label}
              </span>
            </label>
          ))}
        </div>
      )

    case "scale_1_5": case "scale_custom":
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name={name} value={n} required={q.is_required} className="peer sr-only" />
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E0D2] text-sm text-[#201C16] transition-colors peer-checked:border-[#1B2A4A] peer-checked:bg-[#1B2A4A] peer-checked:text-white">
                {n}
              </span>
            </label>
          ))}
        </div>
      )

    case "rating_stars":
      return (
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name={name} value={n} className="peer hidden" required={q.is_required} />
              <span className="text-[#E7E0D2] peer-checked:text-[#B98A2F]">★</span>
            </label>
          ))}
        </div>
      )

    default:
      return <input name={name} className={inputClass} required={q.is_required} />
  }
}