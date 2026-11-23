"use client"

import * as React from "react"
import { Check, Copy, RotateCcw } from "lucide-react"

type Tab = "preview" | "code"

/** One framed example: a Preview / Code switch, replay and copy in the bar, the live demo or its source below. */
export function Preview({ children, code, highlightedCode, label, variant = "center", fit = false }: {
  children: React.ReactNode
  code: string
  /** Build-time highlighter markup for `code`. */
  highlightedCode: string
  label: string
  variant?: "center" | "fill" | "plain"
  /** Centre the example at its own size instead of stretching it to the column. */
  fit?: boolean
}) {
  const id = React.useId()
  const [tab, setTab] = React.useState<Tab>("preview")
  const [run, setRun] = React.useState(0)
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const tabs: Tab[] = ["preview", "code"]

  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true) } catch { setCopied(false); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    const next = tab === "preview" ? "code" : "preview"
    setTab(next)
    document.getElementById(`${id}-${next}-tab`)?.focus()
  }

  return <div className="doc-preview" data-variant={variant} data-fit={fit || undefined}>
    <div className="doc-preview-bar">
      <div role="tablist" aria-label={`${label} example`} className="doc-preview-tabs" onKeyDown={onKeyDown}>
        {tabs.map(name => <button key={name} id={`${id}-${name}-tab`} type="button" role="tab" aria-selected={tab === name} aria-controls={`${id}-${name}`} tabIndex={tab === name ? 0 : -1} onClick={() => setTab(name)}>{name === "preview" ? "Preview" : "Code"}</button>)}
      </div>
      <div className="doc-preview-actions">
        {tab === "preview"
          ? <button type="button" aria-label={`Replay ${label}`} onClick={() => setRun(value => value + 1)}><RotateCcw aria-hidden="true" /></button>
          : <button type="button" aria-label={copied ? "Code copied" : "Copy code"} data-copied={copied} onClick={copy}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}</button>}
      </div>
    </div>
    <div id={`${id}-preview`} role="tabpanel" aria-labelledby={`${id}-preview-tab`} hidden={tab !== "preview"} className="doc-preview-stage">
      <div className="doc-preview-content" key={run}>{children}</div>
    </div>
    <div id={`${id}-code`} role="tabpanel" aria-labelledby={`${id}-code-tab`} hidden={tab !== "code"} className="doc-preview-code" tabIndex={0} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
  </div>
}
