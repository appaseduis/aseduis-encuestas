"use server"

import { createClient } from "@/lib/supabase/server"
import { questionSchema } from "@/lib/validations/question"
import { revalidatePath } from "next/cache"

type ActionResult = { error?: string }

export async function createQuestion(surveyId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const raw = {
    type: formData.get("type") as string,
    label: formData.get("label") as string,
    help_text: formData.get("help_text") as string,
    is_required: formData.get("is_required") === "on",
  }
  const parsed = questionSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { count } = await supabase
    .from("questions").select("id", { count: "exact", head: true }).eq("survey_id", surveyId)

  const { data: question, error } = await supabase.from("questions").insert({
    survey_id: surveyId,
    ...parsed.data,
    order_index: count ?? 0,
  }).select("id").single()
  if (error || !question) return { error: error?.message ?? "Error al crear" }

  const options = formData.getAll("option_label") as string[]
  if (options.length) {
    await supabase.from("question_options").insert(
      options.filter((o) => o.trim()).map((label, i) => ({
        question_id: question.id, label, value: label, order_index: i,
      }))
    )
  }

  revalidatePath(`/dashboard/encuestas/${surveyId}/preguntas`)
  return {}
}

export async function updateQuestion(surveyId: string, questionId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const raw = {
    type: formData.get("type") as string,
    label: formData.get("label") as string,
    help_text: formData.get("help_text") as string,
    is_required: formData.get("is_required") === "on",
  }
  const parsed = questionSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from("questions").update(parsed.data).eq("id", questionId)
  if (error) return { error: error.message }

  await supabase.from("question_options").delete().eq("question_id", questionId)
  const options = formData.getAll("option_label") as string[]
  if (options.length) {
    await supabase.from("question_options").insert(
      options.filter((o) => o.trim()).map((label, i) => ({
        question_id: questionId, label, value: label, order_index: i,
      }))
    )
  }

  revalidatePath(`/dashboard/encuestas/${surveyId}/preguntas`)
  return {}
}

export async function deleteQuestion(surveyId: string, questionId: string) {
  const supabase = await createClient()
  await supabase.from("questions").delete().eq("id", questionId)
  revalidatePath(`/dashboard/encuestas/${surveyId}/preguntas`)
}

export async function duplicateQuestion(surveyId: string, questionId: string) {
  const supabase = await createClient()
  const { data: q } = await supabase.from("questions").select("*, question_options(*)").eq("id", questionId).single()
  if (!q) return

  const { count } = await supabase
    .from("questions").select("id", { count: "exact", head: true }).eq("survey_id", surveyId)

  const { data: newQ } = await supabase.from("questions").insert({
    survey_id: surveyId, type: q.type, label: `${q.label} (copia)`,
    help_text: q.help_text, is_required: q.is_required, order_index: count ?? 0,
  }).select("id").single()

  if (newQ && q.question_options?.length) {
    await supabase.from("question_options").insert(
      q.question_options.map((o: { label: string; value: string; order_index: number }) => ({
        question_id: newQ.id, label: o.label, value: o.value, order_index: o.order_index,
      }))
    )
  }

  revalidatePath(`/dashboard/encuestas/${surveyId}/preguntas`)
}

export async function moveQuestion(surveyId: string, questionId: string, direction: "up" | "down") {
  const supabase = await createClient()
  const { data: questions } = await supabase
    .from("questions").select("id, order_index").eq("survey_id", surveyId).order("order_index")
  if (!questions) return

  const idx = questions.findIndex((q) => q.id === questionId)
  const targetIdx = direction === "up" ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= questions.length) return

  const current = questions[idx]
  const target = questions[targetIdx]

  await supabase.from("questions").update({ order_index: target.order_index }).eq("id", current.id)
  await supabase.from("questions").update({ order_index: current.order_index }).eq("id", target.id)

  revalidatePath(`/dashboard/encuestas/${surveyId}/preguntas`)
}