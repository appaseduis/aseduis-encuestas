"use server"

import { createClient } from "@/lib/supabase/server"
import { surveySchema } from "@/lib/validations/survey"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

type ActionResult = { error?: string }

export async function createSurvey(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    cover_image_url: formData.get("cover_image_url") as string,
    slug: formData.get("slug") as string,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    thank_you_message: formData.get("thank_you_message") as string,
    allow_duplicate_responses: formData.get("allow_duplicate_responses") === "on",
    is_public: formData.get("is_public") === "on",
  }

  const parsed = surveySchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: existing } = await supabase
    .from("surveys").select("id").eq("slug", parsed.data.slug).maybeSingle()
  if (existing) return { error: "Ese slug ya está en uso" }

  const { error } = await supabase.from("surveys").insert({
    ...parsed.data,
    start_date: parsed.data.start_date || null,
    end_date: parsed.data.end_date || null,
    created_by: user.id,
  })
  if (error) return { error: error.message }

  await supabase.from("audit_log").insert({
    admin_id: user.id, action: "create", entity: "survey",
  })

  revalidatePath("/dashboard/encuestas")
  redirect("/dashboard/encuestas")
}

export async function updateSurvey(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    cover_image_url: formData.get("cover_image_url") as string,
    slug: formData.get("slug") as string,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    thank_you_message: formData.get("thank_you_message") as string,
    allow_duplicate_responses: formData.get("allow_duplicate_responses") === "on",
    is_public: formData.get("is_public") === "on",
  }

  const parsed = surveySchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: existing } = await supabase
    .from("surveys").select("id").eq("slug", parsed.data.slug).neq("id", id).maybeSingle()
  if (existing) return { error: "Ese slug ya está en uso" }

  const { error } = await supabase.from("surveys").update({
    ...parsed.data,
    start_date: parsed.data.start_date || null,
    end_date: parsed.data.end_date || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id)
  if (error) return { error: error.message }

  await supabase.from("audit_log").insert({
    admin_id: user.id, action: "update", entity: "survey", entity_id: id,
  })

  revalidatePath("/dashboard/encuestas")
  redirect("/dashboard/encuestas")
}

export async function duplicateSurvey(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: original } = await supabase.from("surveys").select("*").eq("id", id).single()
  if (!original) return

  const newSlug = `${original.slug}-copia-${Date.now().toString(36)}`
  const { data: copy, error } = await supabase.from("surveys").insert({
    title: `${original.title} (copia)`,
    description: original.description,
    cover_image_url: original.cover_image_url,
    slug: newSlug,
    status: "draft",
    thank_you_message: original.thank_you_message,
    allow_duplicate_responses: original.allow_duplicate_responses,
    is_public: original.is_public,
    created_by: user.id,
  }).select("id").single()
  if (error || !copy) return


  const { data: questions } = await supabase
    .from("questions").select("*, question_options(*)").eq("survey_id", id).order("order_index")

  for (const q of questions ?? []) {
    const { data: newQuestion } = await supabase.from("questions").insert({
      survey_id: copy.id, type: q.type, label: q.label, help_text: q.help_text,
      is_required: q.is_required, order_index: q.order_index,
      visible_if: q.visible_if, validation: q.validation,
    }).select("id").single()

    if (newQuestion && q.question_options?.length) {
      await supabase.from("question_options").insert(
        q.question_options.map((o: { label: string; value: string; order_index: number }) => ({
          question_id: newQuestion.id, label: o.label, value: o.value, order_index: o.order_index,
        }))
      )
    }
  }

  await supabase.from("audit_log").insert({
    admin_id: user.id, action: "duplicate", entity: "survey", entity_id: copy.id,
  })

  revalidatePath("/dashboard/encuestas")
}

export async function toggleSurveyStatus(id: string, currentStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const newStatus = currentStatus === "active" ? "closed" : "active"
  const { error } = await supabase.from("surveys").update({ status: newStatus }).eq("id", id)
  if (error) return

  await supabase.from("audit_log").insert({
    admin_id: user.id, action: `status_${newStatus}`, entity: "survey", entity_id: id,
  })

  revalidatePath("/dashboard/encuestas")
}

export async function deleteSurvey(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.from("surveys").delete().eq("id", id)
  if (error) return

  await supabase.from("audit_log").insert({
    admin_id: user.id, action: "delete", entity: "survey", entity_id: id,
  })

  revalidatePath("/dashboard/encuestas")
}