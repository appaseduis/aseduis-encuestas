import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: surveys } = await supabase.from('surveys').select('*')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Inicio</h1>
      <p>Encuestas en base de datos: {surveys?.length ?? 0}</p>
    </div>
  )
}