"use client"

import * as React from "react"
import { Disclosure } from "@/components/disclosure"
import { CopyCommand } from "@/registry/wlkr/copy-command"
import { contrastCss } from "@/lib/contrast-css"
import { ArrowLeftRight, Code2, Copy } from "lucide-react"
import { contrastRatio, generateAAOptions, meets, parseOpaqueHex } from "@/lib/contrast"
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
  const [selectedAAColor, setSelectedAAColor] = React.useState<string | null>(null)
  const [backgroundDraft, setBackgroundDraft] = React.useState<string | null>(null)
  const [textDraft, setTextDraft] = React.useState<string | null>(null)
  const shareRef = React.useRef<HTMLInputElement>(null)
  const copyAttempt = React.useRef(0)

  const bg = parseOpaqueHex(pair.background)!
  const fg = parseOpaqueHex(pair.text)!
  const ratio = contrastRatio(bg, fg)
  const shareUrl = canonicalContrastShareUrl(pair)
  const css = contrastCss(pair)
  const aaOptions = generateAAOptions(pair.background, pair.text)
  const selectedColor = aaOptions.some(option => option.color === selectedAAColor)
    ? selectedAAColor
    : aaOptions.some(option => option.color === pair.text)
      ? pair.text
      : null

  function update(key: keyof ContrastPair, value: string) {
    copyAttempt.current += 1
    setCopyState("")
    if (key === "background") setBackgroundDraft(value)
    else {
      setTextDraft(value)
      setSelectedAAColor(null)
    }
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
    setSelectedAAColor(null)
    const nextPair = { background: pair.text, text: pair.background }
    setBackgroundDraft(null)
    setTextDraft(null)
    window.history.replaceState(null, "", contrastSharePath(nextPair))
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  function applyAAColor() {
    if (!selectedColor || selectedColor === pair.text) return
    copyAttempt.current += 1
    setCopyState("")
    setSelectedAAColor(null)
    const nextPair = { ...pair, text: selectedColor }
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
    <details className="contrast-aa-options">
      <summary>AA text options</summary>
      <div className="contrast-aa-content">
        <fieldset className="contrast-aa-list">
          <legend className="sr-only">Text colour</legend>
          {aaOptions.map(option => (
            <label className="contrast-aa-choice" key={option.color}>
              <input
                type="radio"
                name="contrast-aa-color"
                value={option.color}
                checked={selectedColor === option.color}
                onChange={() => setSelectedAAColor(option.color)}
              />
              <span className="contrast-aa-swatch" style={{ backgroundColor: option.color }} aria-hidden="true" />
              <span className="contrast-aa-choice-copy">
                <strong>{option.color}</strong>
                <span>{option.direction === "Current" ? "Current text" : option.direction} · {option.ratio.toFixed(2)}:1</span>
              </span>
            </label>
          ))}
        </fieldset>
        <button className="contrast-apply" type="button" disabled={!selectedColor || selectedColor === pair.text} onClick={applyAAColor}>Apply</button>
      </div>
    </details>
    <p className="contrast-scope">Opaque sRGB colour pair · Text contrast only · <a href="https://www.w3.org/TR/WCAG22/#contrast-minimum" target="_blank" rel="noreferrer">WCAG 2.2</a></p>
    <div className="contrast-share">
      <label htmlFor="contrast-share-url">Share this pair</label>
      <div><input id="contrast-share-url" ref={shareRef} type="text" readOnly value={shareUrl} onFocus={event => event.currentTarget.select()} /><button type="button" className="contrast-copy" onClick={() => copyValue(shareUrl, shareRef, "Link")}><Copy aria-hidden="true" />Copy link</button></div>
      <p role="status" aria-live="polite">{copyState}</p>
    </div>
    <Disclosure title="CSS" icon={Code2} className="contrast-css-output">
      <CopyCommand key={css} command={css} />
    </Disclosure>
  </section>
}
