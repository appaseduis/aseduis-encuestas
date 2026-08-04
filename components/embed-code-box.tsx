"use client"

import { useState } from "react"

export default function EmbedCodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">Bloque HTML para WordPress (Kubio)</h2>
        <button onClick={handleCopy} className="rounded bg-black px-3 py-1 text-sm text-white">
          {copied ? "¡Copiado!" : "Copiar código"}
        </button>
      </div>
      <p className="mb-2 text-xs text-gray-500">
        Pega este bloque en un elemento HTML personalizado dentro de Kubio.
      </p>
      <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs">{code}</pre>
    </div>
  )
}