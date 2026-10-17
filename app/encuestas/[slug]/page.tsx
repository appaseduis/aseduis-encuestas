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
      <div
        style={style}
        className={`${inter.variable} ${lora.variable} flex min-h-screen items-center justify-center bg-survey px-6 font-sans`}
      >
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 h-px w-10 bg-accent" />
          <h1 className="font-serif text-xl font-semibold text-ink">Encuesta no disponible</h1>
          <p className="mt-2 text-sm text-muted">Esta encuesta no está activa en este momento.</p>
        </div>
      </div>
    )
  }

  const { data: questions } = await supabase
    .from("questions").select("*, question_options(*)").eq("survey_id", survey.id).order("order_index")

  return (
    <div
      style={style}
      className={`${inter.variable} ${lora.variable} min-h-screen bg-survey font-sans text-ink`}
    >
      <div className="mx-auto max-w-xl px-5 pb-16 pt-10 sm:px-6">
        {survey.cover_image_url && (
          <img
            src={survey.cover_image_url}
            alt=""
            className="mb-6 h-40 w-full rounded-xl object-cover sm:h-52"
          />
        )}
        <div className="mb-1 h-1 w-12 rounded-full bg-accent" />
        <h1 className="font-serif text-2xl font-semibold leading-tight text-ink sm:text-3xl">
          {survey.title}
        </h1>
        {survey.description && (
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{survey.description}</p>
        )}


        <PublicSurveyForm
          surveyId={survey.id}
          slug={survey.slug}
          questions={questions ?? []}
          thankYouMessage={survey.thank_you_message}
        />
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