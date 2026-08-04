import { createClient } from "@/lib/supabase/server"
import PublicSurveyForm from "@/components/public-survey-form"
import { notFound } from "next/navigation"

export default async function PublicSurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: survey } = await supabase.from("surveys").select("*").eq("slug", slug).single()
  if (!survey) notFound()

  if (survey.status !== "active") {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-xl font-semibold">Encuesta no disponible</h1>
        <p className="mt-2 text-gray-600">Esta encuesta no está activa en este momento.</p>
      </div>
    )
  }

  const { data: questions } = await supabase
    .from("questions").select("*, question_options(*)").eq("survey_id", survey.id).order("order_index")

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <div className="mx-auto max-w-lg pt-10">
        {survey.cover_image_url && (
          <img src={survey.cover_image_url} alt="" className="mb-4 w-full rounded" />
        )}
        <h1 className="text-2xl font-bold">{survey.title}</h1>
        {survey.description && <p className="mt-2 text-gray-600">{survey.description}</p>}
      </div>
      <PublicSurveyForm
        surveyId={survey.id}
        questions={questions ?? []}
        thankYouMessage={survey.thank_you_message}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function sendHeight() {
              window.parent.postMessage({ type: 'aseduis-survey-height', height: document.body.scrollHeight, slug: '${survey.slug}' }, '*');
            }
            window.addEventListener('load', sendHeight);
            new ResizeObserver(sendHeight).observe(document.body);
          `,
        }}
      />
    </div>
  )
}