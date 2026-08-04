import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: survey } = await supabase.from("surveys").select("title, slug").eq("id", id).single()
  if (!survey) return new NextResponse("Encuesta no encontrada", { status: 404 })

  const { data: questions } = await supabase
    .from("questions").select("id, label").eq("survey_id", id).order("order_index")

  const { data: responses } = await supabase
    .from("responses")
    .select("id, submitted_at, response_answers(question_id, answer_text, answer_number, answer_json)")
    .eq("survey_id", id)
    .order("submitted_at")

  const headers = ["Fecha", ...(questions ?? []).map((q) => q.label)]
  const rows = (responses ?? []).map((r) => {
    const byQuestion = new Map(
      r.response_answers.map((a: { question_id: string; answer_text: string | null; answer_number: number | null; answer_json: string[] | null }) => [
        a.question_id,
        a.answer_json ? a.answer_json.join("; ") : a.answer_text ?? a.answer_number ?? "",
      ])
    )
    return [
      new Date(r.submitted_at).toLocaleString(),
      ...(questions ?? []).map((q) => String(byQuestion.get(q.id) ?? "")),
    ]
  })

  function escapeCsv(value: string) {
    if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
    return value
  }

  const csv = [headers, ...rows]
    .map((row) => row.map((v) => escapeCsv(String(v))).join(","))
    .join("\n")

  const bom = "\uFEFF" // para que Excel abra bien los acentos
  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${survey.slug}-respuestas.csv"`,
    },
  })
}