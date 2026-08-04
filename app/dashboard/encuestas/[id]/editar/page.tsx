import { createClient } from "@/lib/supabase/server"
import SurveyForm from "@/components/survey-form"
import { updateSurvey } from "@/lib/actions/surveys"
import { notFound } from "next/navigation"

export default async function EditarEncuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: survey } = await supabase.from("surveys").select("*").eq("id", id).single()
  if (!survey) notFound()

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Editar encuesta</h1>
      <SurveyForm survey={survey} action={updateSurvey.bind(null, id)} />
    </div>
  )
}