"use client"

import * as React from "react"
import { ArrowLeftRight, Copy } from "lucide-react"
import { contrastRatio, meets, parseOpaqueHex } from "@/lib/contrast"
import { canonicalContrastShareUrl, contrastSharePath, readContrastPair, type ContrastPair } from "@/lib/contrast-link"

function Result({ label, threshold, ratio }: { label: string; threshold: number; ratio: number }) {
  const pass = meets(ratio, threshold)
  return <div className="contrast-result">
    <span>{label}</span><strong data-pass={pass}>{pass ? "Pass" : "Fail"}</strong>
  </div>
}

export function ContrastTool() {
  const search = React.useSyncExternalStore(
    callback => {
      window.addEventListener("popstate", callback)
      return () => window.removeEventListener("popstate", callback)
    },
    () => window.location.search,
    () => "",
  )
  const pair: ContrastPair = readContrastPair(search)
  const [copyState, setCopyState] = React.useState("")
  const [backgroundDraft, setBackgroundDraft] = React.useState<string | null>(null)
  const [textDraft, setTextDraft] = React.useState<string | null>(null)
  const shareRef = React.useRef<HTMLInputElement>(null)
  const cssRef = React.useRef<HTMLInputElement>(null)
  const copyAttempt = React.useRef(0)

  const bg = parseOpaqueHex(pair.background)!
  const fg = parseOpaqueHex(pair.text)!
  const ratio = contrastRatio(bg, fg)
  const shareUrl = canonicalContrastShareUrl(pair)

  function update(key: keyof ContrastPair, value: string) {
    copyAttempt.current += 1
    setCopyState("")
    if (key === "background") setBackgroundDraft(value)
    else setTextDraft(value)
    if (!parseOpaqueHex(value)) return
    const normalized = value.toUpperCase()
    if (key === "background") setBackgroundDraft(null)
    else setTextDraft(null)
    const nextPair = { ...pair, [key]: normalized }
    window.history.replaceState(null, "", contrastSharePath(nextPair))
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  function restoreDraft(key: keyof ContrastPair) {
    if (key === "background") setBackgroundDraft(null)
    else setTextDraft(null)
  }

  function swap() {
    copyAttempt.current += 1
    setCopyState("")
    const nextPair = { background: pair.text, text: pair.background }
    setBackgroundDraft(null)
    setTextDraft(null)
    window.history.replaceState(null, "", contrastSharePath(nextPair))
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  async function copyValue(value: string, input: React.RefObject<HTMLInputElement | null>, label: string) {
    const attempt = ++copyAttempt.current
    try {
      await navigator.clipboard.writeText(value)
      if (attempt === copyAttempt.current) setCopyState(`${label} copied`)
    } catch {
      if (attempt !== copyAttempt.current) return
      input.current?.focus()
      input.current?.select()
      setCopyState(`Copy unavailable. ${label === "CSS" ? "CSS" : label.toLowerCase()} selected to copy.`)
    }
  }

  return <section className="contrast-tool" aria-label="Text and background contrast">
    <div className="contrast-controls">
      <div className="contrast-field" role="group" aria-label="Background"><span>Background</span><span className="contrast-input-row"><input aria-label="Background colour" type="color" value={pair.background} onChange={event => update("background", event.target.value)} /><input aria-label="Background hex value" type="text" inputMode="text" spellCheck={false} value={backgroundDraft ?? pair.background} maxLength={7} onChange={event => update("background", event.target.value)} onBlur={() => restoreDraft("background")} /></span></div>
      <button className="contrast-swap" type="button" aria-label="Swap text and background colours" onClick={swap}><ArrowLeftRight aria-hidden="true" /></button>
      <div className="contrast-field" role="group" aria-label="Text"><span>Text</span><span className="contrast-input-row"><input aria-label="Text colour" type="color" value={pair.text} onChange={event => update("text", event.target.value)} /><input aria-label="Text hex value" type="text" inputMode="text" spellCheck={false} value={textDraft ?? pair.text} maxLength={7} onChange={event => update("text", event.target.value)} onBlur={() => restoreDraft("text")} /></span></div>
    </div>
    <div className="contrast-preview" style={{ backgroundColor: pair.background, color: pair.text }}>
      <p className="contrast-preview-large">Large text</p>
      <p className="contrast-preview-small">Normal text</p>
    </div>
    <div className="contrast-summary"><strong>{ratio.toFixed(2)}:1</strong><span>Contrast ratio</span></div>
    <div className="contrast-results" aria-live="polite">
      <div className="contrast-result-head"><span>WCAG 2.2</span><span>AA</span><span>AAA</span></div>
      <div className="contrast-result-row"><span>Normal text</span><Result label="Normal text AA" threshold={4.5} ratio={ratio} /><Result label="Normal text AAA" threshold={7} ratio={ratio} /></div>
      <div className="contrast-result-row"><span>Large text</span><Result label="Large text AA" threshold={3} ratio={ratio} /><Result label="Large text AAA" threshold={4.5} ratio={ratio} /></div>
    </div>
    <p className="contrast-scope">Opaque sRGB colour pair · Text contrast only · <a href="https://www.w3.org/TR/WCAG22/#contrast-minimum" target="_blank" rel="noreferrer">WCAG 2.2</a></p>
    <div className="contrast-share">
      <label htmlFor="contrast-share-url">Share this pair</label>
      <div><input id="contrast-share-url" ref={shareRef} type="text" readOnly value={shareUrl} onFocus={event => event.currentTarget.select()} /><button type="button" className="contrast-copy" onClick={() => copyValue(shareUrl, shareRef, "Link")}><Copy aria-hidden="true" />Copy link</button></div>
      <label htmlFor="contrast-css">CSS</label>
      <div><input id="contrast-css" ref={cssRef} type="text" readOnly value={`color: ${pair.text}; background-color: ${pair.background};`} onFocus={event => event.currentTarget.select()} /><button type="button" className="contrast-copy" onClick={() => copyValue(`color: ${pair.text}; background-color: ${pair.background};`, cssRef, "CSS")}><Copy aria-hidden="true" />Copy CSS</button></div>
      <p role="status" aria-live="polite">{copyState}</p>
    </div>
  </section>
}
