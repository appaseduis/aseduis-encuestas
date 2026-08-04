import SurveyForm from "@/components/survey-form"
import { createSurvey } from "@/lib/actions/surveys"

export default function NuevaEncuestaPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Nueva encuesta</h1>
      <SurveyForm action={createSurvey} />
    </div>
  )
}