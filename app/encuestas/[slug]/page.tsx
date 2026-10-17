import { createClient } from "@/lib/supabase/server"
import PublicSurveyForm from "@/components/public-survey-form"
import { notFound } from "next/navigation"
import { Lora, Inter } from "next/font/google"
import { getTheme, themeStyle } from "@/lib/themes"

const lora = Lora({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-lora" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default async function PublicSurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: survey } = await supabase.from("surveys").select("*").eq("slug", slug).single()
  if (!survey) notFound()

  const style = themeStyle(getTheme(survey.theme_id))

  if (survey.status !== "active") {
    return (
      <div style={style} className={`survey-root ${inter.variable} ${lora.variable} p-3 font-sans sm:p-4`}>
        <div className="mx-auto flex max-w-2xl items-center justify-center rounded-3xl bg-survey px-6 py-16 shadow-sm ring-1 ring-line">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 h-px w-10 bg-accent" />
            <h1 className="font-serif text-xl font-semibold text-ink">Encuesta no disponible</h1>
            <p className="mt-2 text-sm text-muted">Esta encuesta no está activa en este momento.</p>
          </div>
        </div>
      </div>
    )
  }

  const { data: questions } = await supabase
    .from("questions").select("*, question_options(*)").eq("survey_id", survey.id).order("order_index")

    return (
    <div style={style} className={`survey-root ${inter.variable} ${lora.variable} p-3 font-sans text-ink sm:p-4`}>
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-survey shadow-sm ring-1 ring-line">
        {survey.cover_image_url && (
          <div className="flex justify-center px-5 pt-8 sm:px-10">
            <img
              src={survey.cover_image_url}
              alt=""
              className="h-auto max-h-56 w-full object-contain sm:max-h-72"
            />
          </div>
        )}

        <div className="px-5 pb-12 pt-8 sm:px-10">
          <div className="mb-1 h-1 w-12 rounded-full bg-accent" />
          <h1 className="font-serif text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-muted">
              {survey.description}
            </p>
          )}

          <PublicSurveyForm
            surveyId={survey.id}
            slug={survey.slug}
            questions={questions ?? []}
            thankYouMessage={survey.thank_you_message}
          />
        </div>
      </div>

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