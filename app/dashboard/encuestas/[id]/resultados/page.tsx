import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getEmbedCode } from "@/lib/embed-code"
import EmbedCodeBox from "@/components/embed-code-box"

type OptionCount = { label: string; count: number }

export default async function ResultadosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: survey } = await supabase.from("surveys").select("title, slug").eq("id", id).single()
  if (!survey) notFound()

  const { data: questions } = await supabase
    .from("questions").select("*, question_options(*)").eq("survey_id", id).order("order_index")

  const { data: responses } = await supabase
    .from("responses")
    .select("id, submitted_at, response_answers(question_id, answer_text, answer_number, answer_json)")
    .eq("survey_id", id)

  const total = responses?.length ?? 0

  // Participación por día
  const byDay = new Map<string, number>()
  for (const r of responses ?? []) {
    const day = new Date(r.submitted_at).toLocaleDateString()
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{survey.title}</h1>
          <p className="text-sm text-gray-500">Resultados — {total} respuestas</p>
        </div>
        <a
          href={`/dashboard/encuestas/${id}/resultados/export`}
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          Exportar CSV
        </a>
      </div>

      <div className="mb-8">
        <EmbedCodeBox code={getEmbedCode(survey.slug)} />
      </div>

      {total === 0 ? (
        <p className="text-gray-400">Aún no hay respuestas.</p>
      ) : (
        <>
          <div className="mb-8 rounded border bg-white p-4">
            <h2 className="mb-3 font-semibold">Participación por día</h2>
            <div className="space-y-1">
              {[...byDay.entries()].map(([day, count]) => (
                <div key={day} className="flex items-center gap-2 text-sm">
                  <span className="w-28 text-gray-500">{day}</span>
                  <div className="h-4 bg-black" style={{ width: `${(count / total) * 200}px` }} />
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {questions?.map((q) => (
              <QuestionResult key={q.id} question={q} responses={responses ?? []} total={total} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function QuestionResult({
  question, responses, total,
}: {
  question: { id: string; label: string; type: string; question_options: { label: string; value: string }[] }
  responses: { response_answers: { question_id: string; answer_text: string | null; answer_number: number | null; answer_json: string[] | null }[] }[]
  total: number
}) {
  const answers = responses
    .flatMap((r) => r.response_answers)
    .filter((a) => a.question_id === question.id)

  const hasOptions = ["radio", "dropdown", "checkbox", "yes_no", "scale_1_5", "scale_custom", "rating_stars"].includes(question.type)

  if (hasOptions) {
    const counts = new Map<string, number>()
    for (const a of answers) {
      const values = a.answer_json ?? (a.answer_text ? [a.answer_text] : a.answer_number != null ? [String(a.answer_number)] : [])
      for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
    }

    const labelFor = (value: string) => {
      if (question.type === "yes_no") return value === "yes" ? "Sí" : "No"
      const opt = question.question_options.find((o) => o.value === value)
      return opt?.label ?? value
    }

    const results: OptionCount[] = [...counts.entries()]
      .map(([value, count]) => ({ label: labelFor(value), count }))
      .sort((a, b) => b.count - a.count)

    const answered = answers.length
    return (
      <div className="rounded border bg-white p-4">
        <h3 className="mb-1 font-medium">{question.label}</h3>
        <p className="mb-3 text-xs text-gray-400">{answered} de {total} respondieron</p>
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.label} className="text-sm">
              <div className="mb-1 flex justify-between">
                <span>{r.label}</span>
                <span className="text-gray-500">{r.count} ({Math.round((r.count / (answered || 1)) * 100)}%)</span>
              </div>
              <div className="h-2 rounded bg-gray-100">
                <div
                  className="h-2 rounded bg-black"
                  style={{ width: `${(r.count / (answered || 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {results.length === 0 && <p className="text-sm text-gray-400">Sin respuestas aún</p>}
        </div>
      </div>
    )
  }

  // Preguntas abiertas: número, texto, email, fecha, etc.
  const textAnswers = answers
    .map((a) => a.answer_text ?? (a.answer_number != null ? String(a.answer_number) : null))
    .filter(Boolean) as string[]

  return (
    <div className="rounded border bg-white p-4">
      <h3 className="mb-1 font-medium">{question.label}</h3>
      <p className="mb-3 text-xs text-gray-400">{textAnswers.length} de {total} respondieron</p>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {textAnswers.map((t, i) => (
          <p key={i} className="rounded bg-gray-50 p-2 text-sm">{t}</p>
        ))}
        {textAnswers.length === 0 && <p className="text-sm text-gray-400">Sin respuestas aún</p>}
      </div>
    </div>
  )
}