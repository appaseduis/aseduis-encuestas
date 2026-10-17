import { THEMES, DEFAULT_THEME_ID, isThemeId } from "@/lib/themes"

export default function ThemePicker({ defaultValue }: { defaultValue?: string | null }) {
  const current = isThemeId(defaultValue) ? defaultValue : DEFAULT_THEME_ID

  return (
    <fieldset>
      <legend className="block text-sm font-medium">Paleta de colores</legend>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Object.values(THEMES).map((t) => (
          <label key={t.id} className="cursor-pointer">
            <input
              type="radio" name="theme_id" value={t.id}
              defaultChecked={t.id === current} className="peer sr-only"
            />
            <div className="rounded-lg border border-gray-200 p-1.5 transition hover:border-gray-400 peer-checked:ring-2 peer-checked:ring-black peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
              <div className="rounded-md p-2" style={{ background: t.bg }}>
                <div className="space-y-1.5 rounded p-2 shadow-sm" style={{ background: t.cardBg }}>
                  <div className="h-1 w-6 rounded-full" style={{ background: t.accent }} />
                  <div className="h-1.5 w-3/4 rounded" style={{ background: t.text }} />
                  <div className="h-1.5 w-1/2 rounded opacity-60" style={{ background: t.muted }} />
                  <div className="h-3 rounded-full" style={{ background: t.brand }} />
                </div>
              </div>
              <p className="mt-1.5 text-center text-xs font-medium">{t.name}</p>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  )
}