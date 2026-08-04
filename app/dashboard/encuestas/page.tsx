import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { duplicateSurvey, toggleSurveyStatus, deleteSurvey } from "@/lib/actions/surveys"

const statusColors: Record<string, string> = {
  draft: "bg-gray-200 text-gray-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
}
const statusLabels: Record<string, string> = { draft: "Borrador", active: "Activa", closed: "Cerrada" }

export default async function EncuestasPage() {
  const supabase = await createClient()
  const { data: surveys } = await supabase
    .from("surveys")
    .select("*, responses(count)")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Encuestas</h1>
        <Link href="/dashboard/encuestas/nueva" className="rounded bg-black px-4 py-2 text-white">
          + Nueva encuesta
        </Link>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
        <thead className="bg-gray-50 text-left text-sm text-gray-500">
          <tr>
            <th className="p-3">Título</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Inicio</th>
            <th className="p-3">Fin</th>
            <th className="p-3">Respuestas</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {surveys?.map((s) => (
            <tr key={s.id} className="border-t text-sm">
              <td className="p-3 font-medium">{s.title}</td>
              <td className="p-3">
                <span className={`rounded-full px-2 py-1 text-xs ${statusColors[s.status]}`}>
                  {statusLabels[s.status]}
                </span>
              </td>
              <td className="p-3">{s.start_date ? new Date(s.start_date).toLocaleDateString() : "—"}</td>
              <td className="p-3">{s.end_date ? new Date(s.end_date).toLocaleDateString() : "—"}</td>
              <td className="p-3">{s.responses?.[0]?.count ?? 0}</td>
              <td className="flex flex-wrap gap-2 p-3">
                <Link href={`/dashboard/encuestas/${s.id}/editar`} className="text-blue-600 hover:underline">
                  Editar
                </Link>
                <Link href={`/dashboard/encuestas/${s.id}/preguntas`} className="text-blue-600 hover:underline">
                  Preguntas
                </Link>
                <Link href={`/dashboard/encuestas/${s.id}/resultados`} className="text-blue-600 hover:underline">
                  Resultados
                </Link>
                <form action={duplicateSurvey.bind(null, s.id)}>
                  <button className="text-blue-600 hover:underline">Duplicar</button>
                </form>
                <form action={toggleSurveyStatus.bind(null, s.id, s.status)}>
                  <button className="text-amber-600 hover:underline">
                    {s.status === "active" ? "Desactivar" : "Activar"}
                  </button>
                </form>
                <form
                  action={deleteSurvey.bind(null, s.id)}
                >
                  <button className="text-red-600 hover:underline">Eliminar</button>
                </form>
              </td>
            </tr>
          ))}
          {!surveys?.length && (
            <tr><td colSpan={6} className="p-6 text-center text-gray-400">No hay encuestas todavía</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}