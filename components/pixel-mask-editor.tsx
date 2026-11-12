"use client"

import * as React from "react"
import { PIXEL_EXAMPLES } from "@/lib/pixel-examples"
import { createGridImportSession } from "@/lib/pixel-grid-import"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { encodeArtwork, maskShareUrl } from "@/lib/pixel-mask-link"
import { Button } from "@/components/ui/button"
import { ChoiceControl } from "@/components/playground-controls"
import { MaskInkControl } from "@/components/mask-ink-control"
import { blankMask, cellAtPoint, inkBackdrop, maskLine, maskReducer, MASK_SIZES, moveMaskCell, transformMask, type MaskTransform, type MaskAction, type MaskState } from "@/lib/pixel-mask"

type Gesture = { pointer: number; kind: "paint"; last: number | null; filled: boolean } | { pointer: number; kind: "pan"; x: number; y: number; left: number; top: number }
export function PixelMaskEditor({ state, dispatch }: { state: MaskState; dispatch: React.Dispatch<MaskAction> }) {
  const imports = React.useRef(createGridImportSession())
  const fileInput = React.useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = React.useState<{ message: string; error: boolean } | null>(null)
  function invalidateImport() { imports.current.invalidate(); setImportStatus(null) }
  function edit(action: MaskAction) { invalidateImport(); dispatch(action) }
  async function openGrid(file: File | undefined) {
    if (!file) { invalidateImport(); return }
    const input = fileInput.current
    setImportStatus({ message: "Opening grid…", error: false })
    const result = await imports.current.open(file, mask => { if (input?.isConnected) command({ type: "replace", mask }, Boolean(document.activeElement?.closest(".mask-grid"))) })
    if (!input?.isConnected) return
    if (result === "opened") setImportStatus({ message: "Grid opened.", error: false })
    else if (result === "invalid") setImportStatus({ message: "Use an 8×8, 16×16 or 32×32 UTF-8 dot/hash grid, at most 4 KiB.", error: true })
  }
  const [examplesOpen, setExamplesOpen] = React.useState(false)
  const [transformOpen, setTransformOpen] = React.useState(false)
  const size = state.mask.length
  const [tool, setTool] = React.useState<"draw" | "erase" | "pan">("draw")
  const [active, setActive] = React.useState(0)
  const activeCell = Math.min(active, size * size - 1)
  const cells = React.useRef<(HTMLButtonElement | null)[]>([])
  const viewport = React.useRef<HTMLDivElement>(null)
  const stroke = React.useRef<Gesture | null>(null)
  const instructions = React.useId(), shareInputId = React.useId()
  const shareInput = React.useRef<HTMLInputElement>(null)
  const sharingRef = React.useRef(false)
  const [sharing, setSharing] = React.useState(false)
  const [shared, setShared] = React.useState<{ key: string; url: string; message: string; error: boolean } | null>(null)
  const maskKey = encodeArtwork(state.mask, state.ink)
  const visibleShare = shared?.key === maskKey ? shared : null
  async function share() {
    if (sharingRef.current) return
    finish(); sharingRef.current = true; setSharing(true)
    const url = maskShareUrl(state.mask, state.ink)
    setShared({ key: maskKey, url, message: "Copying link…", error: false })
    try { await navigator.clipboard.writeText(url); setShared({ key: maskKey, url, message: "Link copied.", error: false }) }
    catch {
      setShared({ key: maskKey, url, message: "Copy unavailable. Select the link.", error: true })
      setTimeout(() => { shareInput.current?.focus(); shareInput.current?.select() }, 0)
    } finally { sharingRef.current = false; setSharing(false) }
  }
  React.useEffect(() => {
    const current = imports.current, input = fileInput.current
    const cancel = () => { current.invalidate(); setImportStatus(null) }
    input?.addEventListener("cancel", cancel)
    return () => { input?.removeEventListener("cancel", cancel); current.invalidate(); dispatch({ type: "end" }) }
  }, [dispatch])
  function focus(cell: number, reveal = false) {
    invalidateImport(); setActive(cell); cells.current[cell]?.focus({ preventScroll: true })
    if (reveal) cells.current[cell]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" })
  }
  function finish() { if (stroke.current) { stroke.current = null; edit({ type: "end" }) } }
  function command(action: MaskAction, keepGridFocus = false) {
    finish()
    const nextSize = ["replace", "resize", "undo", "redo", "reset"].includes(action.type) ? maskReducer(state, action).mask.length : size
    const offset = (nextSize - size) / 2
    const target = Math.max(0, Math.min(nextSize - 1, Math.floor(activeCell / size) + offset)) * nextSize + Math.max(0, Math.min(nextSize - 1, activeCell % size + offset))
    if (nextSize !== size) setActive(target)
    edit(action)
    if (keepGridFocus) requestAnimationFrame(() => focus(target, true))
  }
  function point(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    return cellAtPoint(event.clientX - bounds.left, event.clientY - bounds.top, bounds.width, bounds.height, size)
  }
  function keydown(event: React.KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && ["z", "y"].includes(event.key.toLowerCase())) {
      event.preventDefault(); command({ type: event.key.toLowerCase() === "y" || event.shiftKey ? "redo" : "undo" }, true)
    } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      event.preventDefault(); focus(moveMaskCell(activeCell, event.key, event.ctrlKey || event.metaKey, size), true)
    } else if (["Delete", "Backspace"].includes(event.key)) {
      event.preventDefault(); command({ type: "paint", cells: [activeCell], filled: false })
    }
  }
  const canUndo = state.past.length > 0 || Boolean(state.stroke && (state.stroke.ink !== state.ink || state.stroke.mask.join("") !== state.mask.join("")))
  const gridStyle = { width: size === 8 ? "100%" : size * 26 - 2, "--mask-ink": state.ink || "var(--foreground)", "--mask-canvas": inkBackdrop(state.ink) || "var(--muted)" } as React.CSSProperties
  return <section className="mask-editor" aria-label="Custom pixel mask editor">
    <div className="mask-options">
      <ChoiceControl label="Grid" value={String(size)} options={MASK_SIZES.map(size => ({ value: String(size), label: `${size} × ${size}` }))} onChange={value => command({ type: "resize", size: Number(value) })} />
      <MaskInkControl key={state.ink || "theme"} ink={state.ink} onChange={ink => command({ type: "ink", ink })} />
    </div>
    <div className="mask-tools" role="group" aria-label="Mask tools">
      <input ref={fileInput} type="file" accept=".txt,text/plain" hidden aria-label="Open grid file" onChange={event => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; void openGrid(file) }} />
      <Button type="button" variant="ghost" className="min-h-11" onClick={() => { finish(); invalidateImport(); if (fileInput.current) { fileInput.current.value = ""; fileInput.current.click() } }}>Open grid</Button>
      <Popover open={examplesOpen} onOpenChange={open => { if (open) { finish(); invalidateImport() }; setExamplesOpen(open) }}>
        <PopoverTrigger asChild><Button type="button" variant="ghost" className="min-h-11">Examples</Button></PopoverTrigger>
        <PopoverContent align="start" aria-label="Pixel examples" className="flex w-52 max-w-[calc(100vw-2rem)] flex-col p-1 motion-reduce:animate-none">
          {PIXEL_EXAMPLES.map(example => <Button key={example.id} type="button" variant="ghost" className="min-h-11 justify-start gap-3" onClick={() => { command({ type: "replace", mask: [...example.mask] }); setExamplesOpen(false) }}>
            <svg aria-hidden="true" width="24" height="24" viewBox={"0 0 " + example.mask.length + " " + example.mask.length} fill="currentColor" shapeRendering="crispEdges">{example.mask.flatMap((row, y) => [...row].flatMap((cell, x) => cell === "#" ? [<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />] : []))}</svg>
            {example.label}
          </Button>)}
        </PopoverContent>
      </Popover>
      <Button type="button" variant="ghost" className="min-h-11" aria-pressed={tool === "draw"} onClick={() => { invalidateImport(); setTool("draw") }}>Draw</Button>
      <Button type="button" variant="ghost" className="min-h-11" aria-pressed={tool === "erase"} onClick={() => { invalidateImport(); setTool("erase") }}>Erase</Button>
      <Button type="button" variant="ghost" className="min-h-11" aria-pressed={tool === "pan"} onClick={() => { invalidateImport(); setTool("pan") }}>Pan</Button>
      <Popover open={transformOpen} onOpenChange={open => { if (open) { finish(); invalidateImport() }; setTransformOpen(open) }}>
        <PopoverTrigger asChild><Button type="button" variant="ghost" className="min-h-11">Transform</Button></PopoverTrigger>
        <PopoverContent align="start" aria-label="Transform artwork" className="flex w-60 max-w-[calc(100vw-2rem)] flex-col p-1 motion-reduce:animate-none">
          {([['flip-horizontal', 'Flip horizontal'], ['flip-vertical', 'Flip vertical'], ['rotate-clockwise', 'Rotate clockwise 90°']] as [MaskTransform, string][]).map(([transform, label]) => <Button key={transform} type="button" variant="ghost" className="min-h-11 justify-start" onClick={() => { command({ type: "replace", mask: transformMask(state.mask, transform) }); setTransformOpen(false) }}>{label}</Button>)}
        </PopoverContent>
      </Popover>
      <Button type="button" variant="ghost" className="min-h-11" disabled={!canUndo} onClick={() => command({ type: "undo" })}>Undo</Button>
      <Button type="button" variant="ghost" className="min-h-11" disabled={!state.future.length} onClick={() => command({ type: "redo" })}>Redo</Button>
      <Button type="button" variant="ghost" className="min-h-11" onClick={() => command({ type: "replace", mask: blankMask(size) })}>Clear</Button>
      <Button type="button" variant="ghost" className="min-h-11" aria-label="Reset mask" onClick={() => command({ type: "reset" })}>Reset</Button>
      <Button type="button" variant="ghost" className="min-h-11" disabled={sharing} onClick={share}>{sharing ? "Sharing…" : "Share"}</Button>
    </div>
    {importStatus && <p role={importStatus.error ? "alert" : "status"} className={importStatus.error ? "mask-link-error" : "sr-only"}>{importStatus.message}</p>}
    {visibleShare && <div className="mask-share"><label className="sr-only" htmlFor={shareInputId}>Mask share URL</label><Input className="min-h-11" ref={shareInput} id={shareInputId} readOnly value={visibleShare.url} spellCheck={false} autoComplete="off" onFocus={event => event.currentTarget.select()} /><p role="status" aria-live="polite" className={visibleShare.error ? "mask-link-error" : "sr-only"}>{visibleShare.message}</p></div>}
    <p id={instructions} className="sr-only">{size} rows and {size} columns. Arrow keys move and reveal cells. Space or Enter applies Draw or Erase. Pan drags the detail view without painting. Delete clears a cell. Home and End move within a row; Control or Command moves to the grid ends. Control or Command Z undoes; Shift Z redoes. Shrinking crops the centre; Undo restores the previous size and pixels.</p>
    <div ref={viewport} className="mask-viewport">
      <div className="mask-grid" style={gridStyle} data-tool={tool} role="grid" aria-label="Pixel mask" aria-rowcount={size} aria-colcount={size} aria-multiselectable="true" aria-describedby={instructions} onKeyDown={keydown}
        onPointerDown={event => {
          if (event.button !== 0 || !event.isPrimary || stroke.current) return
          const cell = point(event)
          if (cell === null) return
          invalidateImport(); event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId)
          if (tool === "pan" && viewport.current) { stroke.current = { pointer: event.pointerId, kind: "pan", x: event.clientX, y: event.clientY, left: viewport.current.scrollLeft, top: viewport.current.scrollTop }; return }
          stroke.current = { pointer: event.pointerId, kind: "paint", last: cell, filled: tool === "draw" }
          edit({ type: "begin" }); edit({ type: "paint", cells: [cell], filled: tool === "draw" }); focus(cell)
        }}
        onPointerMove={event => {
          const current = stroke.current
          if (!current || current.pointer !== event.pointerId) return
          if (current.kind === "pan") { if (viewport.current) { viewport.current.scrollLeft = current.left - event.clientX + current.x; viewport.current.scrollTop = current.top - event.clientY + current.y }; return }
          const cell = point(event)
          if (cell !== null) edit({ type: "paint", cells: current.last === null ? [cell] : maskLine(current.last, cell, size), filled: current.filled })
          current.last = cell
        }}
        onPointerUp={event => { if (stroke.current?.pointer === event.pointerId) { finish(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) } }} onPointerCancel={finish} onLostPointerCapture={finish}>
        {state.mask.map((row, y) => <div role="row" aria-rowindex={y + 1} key={y} style={{ gridTemplateColumns: `repeat(${size},minmax(0,1fr))` }}>{[...row].map((value, x) => {
          const cell = y * size + x, filled = value === "#"
          return <button key={x} ref={node => { cells.current[cell] = node }} type="button" role="gridcell" className="mask-cell" data-mask-cell={cell} data-filled={filled} aria-colindex={x + 1} aria-selected={filled} aria-label={`Row ${y + 1}, column ${x + 1}, ${filled ? "filled" : "empty"}`} tabIndex={activeCell === cell ? 0 : -1} onFocus={() => { invalidateImport(); setActive(cell) }} onClick={event => { if (event.detail === 0 && tool !== "pan") command({ type: "paint", cells: [cell], filled: tool === "draw" }) }} />
        })}</div>)}
      </div>
    </div>
    <p className="sr-only" role="status">{state.mask.join("").split("#").length - 1} filled cells.</p>
  </section>
}
