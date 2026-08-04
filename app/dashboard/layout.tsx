import Link from "next/link"

const links = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/dashboard/encuestas", label: "Encuestas" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-white p-4">
        <h2 className="mb-6 font-bold">ASEDUIS</h2>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}