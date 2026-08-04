"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies, headers } from "next/headers"

type ActionResult = { error?: string; success?: boolean }

export async function submitResponse(surveyId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: survey } = await supabase.from("surveys").select("*").eq("id", surveyId).single()
  if (!survey) return { error: "Encuesta no encontrada" }
  if (survey.status !== "active") return { error: "Esta encuesta no está activa" }

  const now = new Date()
  if (survey.start_date && now < new Date(survey.start_date)) return { error: "Esta encuesta aún no ha iniciado" }
  if (survey.end_date && now > new Date(survey.end_date)) return { error: "Esta encuesta ya finalizó" }

  const cookieStore = await cookies()
  const cookieName = `survey_${survey.slug}_done`

  if (!survey.allow_duplicate_responses && cookieStore.get(cookieName)) {
    return { error: "Ya has respondido esta encuesta" }
  }

  const { data: questions } = await supabase
    .from("questions").select("id, is_required, type").eq("survey_id", surveyId)

  for (const q of questions ?? []) {
    if (q.is_required) {
      const value = formData.get(`q_${q.id}`)
      const values = formData.getAll(`q_${q.id}`)
      if ((!value || value === "") && values.length === 0) {
        return { error: "Falta responder una o más preguntas obligatorias" }
      }
    }
  }

  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? null
  const userAgent = headersList.get("user-agent") ?? null

  const { data: participant } = await supabase.from("participants").insert({
    survey_id: surveyId, ip_address: ip, user_agent: userAgent,
  }).select("id").single()

  const { data: response, error: responseError } = await supabase.from("responses").insert({
    survey_id: surveyId, participant_id: participant?.id ?? null,
  }).select("id").single()
  if (responseError || !response) return { error: "Error al guardar la respuesta" }

  const answers = (questions ?? []).map((q) => {
    if (q.type === "checkbox") {
      const values = formData.getAll(`q_${q.id}`) as string[]
      return { response_id: response.id, question_id: q.id, answer_json: values }
    }
    const raw = formData.get(`q_${q.id}`) as string | null
    if (raw === null || raw === "") return null
    if (q.type === "number" || q.type === "scale_1_5" || q.type === "scale_custom" || q.type === "rating_stars") {
      return { response_id: response.id, question_id: q.id, answer_number: Number(raw) }
    }
    return { response_id: response.id, question_id: q.id, answer_text: raw }
  }).filter(Boolean)

  if (answers.length) {
    await supabase.from("response_answers").insert(answers as never[])
  }

  if (participant) {
    await supabase.from("participants").update({ finished_at: new Date().toISOString() }).eq("id", participant.id)
  }

  if (!survey.allow_duplicate_responses) {
    cookieStore.set(cookieName, "1", { maxAge: 60 * 60 * 24 * 365 })
  }

  return { success: true }
}