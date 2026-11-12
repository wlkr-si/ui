"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { blankMask, cellAtPoint, maskLine, MASK_SIZE, moveMaskCell, starterMask, type MaskAction, type MaskState } from "@/lib/pixel-mask"

export function PixelMaskEditor({ state, dispatch }: { state: MaskState; dispatch: React.Dispatch<MaskAction> }) {
  const [tool, setTool] = React.useState<"draw" | "erase">("draw")
  const [active, setActive] = React.useState(0)
  const cells = React.useRef<(HTMLButtonElement | null)[]>([])
  const stroke = React.useRef<{ pointer: number; last: number | null; filled: boolean } | null>(null)
  const instructions = React.useId()
  React.useEffect(() => () => dispatch({ type: "end" }), [dispatch])
  function focus(cell: number) { setActive(cell); cells.current[cell]?.focus({ preventScroll: true }) }
  function finish() { if (stroke.current) { stroke.current = null; dispatch({ type: "end" }) } }
  function command(action: MaskAction) { finish(); dispatch(action) }
  function point(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    return cellAtPoint(event.clientX - bounds.left, event.clientY - bounds.top, bounds.width, bounds.height)
  }
  function keydown(event: React.KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && ["z", "y"].includes(event.key.toLowerCase())) {
      event.preventDefault()
      command({ type: event.key.toLowerCase() === "y" || event.shiftKey ? "redo" : "undo" })
    } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      event.preventDefault(); focus(moveMaskCell(active, event.key, event.ctrlKey || event.metaKey))
    } else if (["Delete", "Backspace"].includes(event.key)) {
      event.preventDefault(); command({ type: "paint", cells: [active], filled: false })
    }
  }
  const canUndo = state.past.length > 0 || Boolean(state.stroke && state.stroke.join("") !== state.mask.join(""))
  return <section className="mask-editor" aria-label="Custom pixel mask editor">
    <div className="mask-tools" role="group" aria-label="Mask tools">
      <Button type="button" variant="ghost" className="min-h-11" aria-pressed={tool === "draw"} onClick={() => setTool("draw")}>Draw</Button>
      <Button type="button" variant="ghost" className="min-h-11" aria-pressed={tool === "erase"} onClick={() => setTool("erase")}>Erase</Button>
      <Button type="button" variant="ghost" className="min-h-11" disabled={!canUndo} onClick={() => command({ type: "undo" })}>Undo</Button>
      <Button type="button" variant="ghost" className="min-h-11" disabled={!state.future.length} onClick={() => command({ type: "redo" })}>Redo</Button>
      <Button type="button" variant="ghost" className="min-h-11" onClick={() => command({ type: "replace", mask: blankMask() })}>Clear</Button>
      <Button type="button" variant="ghost" className="min-h-11" aria-label="Reset mask" onClick={() => command({ type: "replace", mask: starterMask() })}>Reset</Button>
    </div>
    <p id={instructions} className="sr-only">Eight rows and eight columns. Arrow keys move. Space or Enter applies Draw or Erase. Delete clears a cell. Home and End move within a row; Control or Command moves to the grid ends. Control or Command Z undoes; Shift Z redoes.</p>
    <div className="mask-grid" role="grid" aria-label="Pixel mask" aria-rowcount={MASK_SIZE} aria-colcount={MASK_SIZE} aria-multiselectable="true" aria-describedby={instructions} onKeyDown={keydown}
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary || stroke.current) return
        const cell = point(event)
        if (cell === null) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        stroke.current = { pointer: event.pointerId, last: cell, filled: tool === "draw" }
        dispatch({ type: "begin" }); dispatch({ type: "paint", cells: [cell], filled: tool === "draw" }); focus(cell)
      }}
      onPointerMove={event => {
        const current = stroke.current
        if (!current || current.pointer !== event.pointerId) return
        const cell = point(event)
        if (cell !== null) dispatch({ type: "paint", cells: current.last === null ? [cell] : maskLine(current.last, cell), filled: current.filled })
        current.last = cell
      }}
      onPointerUp={event => { if (stroke.current?.pointer === event.pointerId) { finish(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) } }}
      onPointerCancel={finish} onLostPointerCapture={finish}>
      {state.mask.map((row, y) => <div role="row" aria-rowindex={y + 1} key={y}>{[...row].map((value, x) => {
        const cell = y * MASK_SIZE + x, filled = value === "#"
        return <button key={x} ref={node => { cells.current[cell] = node }} type="button" role="gridcell" className="mask-cell" data-mask-cell={cell} data-filled={filled} aria-colindex={x + 1} aria-selected={filled} aria-label={`Row ${y + 1}, column ${x + 1}, ${filled ? "filled" : "empty"}`} tabIndex={active === cell ? 0 : -1} onFocus={() => setActive(cell)} onClick={event => { if (event.detail === 0) command({ type: "paint", cells: [cell], filled: tool === "draw" }) }} />
      })}</div>)}
    </div>
    <p className="sr-only" role="status">{state.mask.join("").split("#").length - 1} filled cells.</p>
  </section>
}
