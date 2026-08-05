"use client"

export default function DeleteResponsesButton({
  surveyId,
  action,
}: {
  surveyId: string
  action: (surveyId: string) => Promise<void>
}) {
  return (
    <form
      action={action.bind(null, surveyId)}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar todas las respuestas de esta encuesta? Esta acción no se puede deshacer.")) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="rounded bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100"
      >
        Eliminar respuestas
      </button>
    </form>
  )
}