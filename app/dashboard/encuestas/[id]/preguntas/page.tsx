import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import QuestionList from "@/components/question-list"

export default async function PreguntasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: survey } = await supabase.from("surveys").select("title").eq("id", id).single()
  if (!survey) notFound()

  const { data: questions } = await supabase
    .from("questions")
    .select("*, question_options(*)")
    .eq("survey_id", id)
    .order("order_index")

  return (
    <div className="p-8">
      <h1 className="mb-1 text-2xl font-bold">{survey.title}</h1>
      <p className="mb-6 text-sm text-gray-500">Preguntas de la encuesta</p>
      <QuestionList surveyId={id} questions={questions ?? []} />
    </div>
  )
}