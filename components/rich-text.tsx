import type { ReactNode } from "react"

const TOKEN =
  /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|((?:https?:\/\/|www\.)[^\s<]+)|([\w.+-]+@[\w-]+\.[\w.-]+)|\*\*([^*]+)\*\*/g

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent underline underline-offset-2 [overflow-wrap:anywhere] hover:opacity-80"
    >
      {children}
    </a>
  )
}

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(TOKEN)) {
    const i = m.index!
    if (i > last) out.push(text.slice(last, i))
    const [full, mdText, mdUrl, url, email, bold] = m

    if (mdText) {
      out.push(<A key={i} href={mdUrl}>{mdText}</A>)
      last = i + full.length
    } else if (url) {
      const clean = url.replace(/[.,;:!?)]+$/, "")
      out.push(<A key={i} href={clean.startsWith("www.") ? `https://${clean}` : clean}>{clean}</A>)
      last = i + clean.length
    } else if (email) {
      const clean = email.replace(/\.+$/, "")
      out.push(<A key={i} href={`mailto:${clean}`}>{clean}</A>)
      last = i + clean.length
    } else {
      out.push(<strong key={i} className="font-semibold text-ink">{bold}</strong>)
      last = i + full.length
    }
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

const BULLET = /^\s*[-•*]\s+/

export default function RichText({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean)
  const blocks: ReactNode[] = []

  for (let k = 0; k < lines.length; k++) {
    if (BULLET.test(lines[k])) {
      const items: string[] = []
      while (k < lines.length && BULLET.test(lines[k])) items.push(lines[k++].replace(BULLET, ""))
      k--
      blocks.push(
        <ul key={k} className="list-disc space-y-1.5 pl-5 marker:text-accent">
          {items.map((it, j) => <li key={j}>{inline(it)}</li>)}
        </ul>
      )
    } else {
      blocks.push(<p key={k}>{inline(lines[k])}</p>)
    }
  }

  return <div className={`space-y-4 ${className}`}>{blocks}</div>
}