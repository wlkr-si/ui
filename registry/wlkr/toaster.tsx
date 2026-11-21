"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Tone = "default" | "success" | "error"
type Leaving = false | "drop" | "left" | "right"

export type ToastOptions = {
  description?: string
  tone?: Tone
  /** Milliseconds on screen, 1500–60000. `Infinity` stays until dismissed. */
  duration?: number
  action?: { label: string; onClick: () => void }
  /** Reusing an id updates that toast in place and restarts its timer. */
  id?: string
}

export type ToasterProps = Omit<React.ComponentPropsWithoutRef<"section">, "children" | "aria-label"> & {
  position?: "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "top-center"
  /** Toasts visible at once, 1–6. Older ones leave first. */
  max?: number
  /** Accessible name of the region. */
  label?: string
}

type ToastRecord = { id: string; message: string; description?: string; tone: Tone; duration: number; action?: ToastOptions["action"]; leaving: Leaving }

const POSITIONS = ["bottom-right", "bottom-left", "bottom-center", "top-right", "top-left", "top-center"]
const CELLS = 24
const EXIT = 180
const EMPTY: ToastRecord[] = []
let toasts: ToastRecord[] = EMPTY
let counter = 0
const listeners = new Set<() => void>()
const removals = new Map<string, ReturnType<typeof setTimeout>>()
const remaining = new Map<string, number>()

const emit = (next: ToastRecord[]) => { toasts = next; listeners.forEach(notify => notify()) }
const subscribe = (notify: () => void) => { listeners.add(notify); return () => { listeners.delete(notify) } }
const clampDuration = (input: unknown) => {
  if (input === Infinity) return Infinity
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? 4000 : Math.min(60000, Math.max(1500, number))
}

function close(id: string, leaving: Exclude<Leaving, false> = "drop") {
  if (!toasts.some(item => item.id === id && !item.leaving)) return
  remaining.delete(id)
  emit(toasts.map(item => item.id === id ? { ...item, leaving } : item))
  removals.set(id, setTimeout(() => { removals.delete(id); emit(toasts.filter(item => item.id !== id)) }, EXIT))
}

function show(message: string, options: ToastOptions = {}, tone?: Tone): string {
  const id = options.id || `wlkr-toast-${++counter}`
  const record: ToastRecord = { id, message: String(message ?? ""), description: options.description, tone: tone ?? options.tone ?? "default", duration: clampDuration(options.duration), action: options.action, leaving: false }
  clearTimeout(removals.get(id))
  removals.delete(id)
  remaining.delete(id)
  emit(toasts.some(item => item.id === id) ? toasts.map(item => item.id === id ? record : item) : [...toasts, record])
  return id
}

/** Shows a toast from anywhere and returns its id. A `<Toaster />` must be mounted to see it. */
export const toast = Object.assign((message: string, options?: ToastOptions) => show(message, options), {
  success: (message: string, options?: ToastOptions) => show(message, options, "success"),
  error: (message: string, options?: ToastOptions) => show(message, options, "error"),
  /** Dismisses one toast, or all of them without an id. */
  dismiss: (id?: string) => (id === undefined ? toasts.map(item => item.id) : [id]).forEach(each => close(each)),
})

const styles = `
.wlkr-toaster{position:fixed;z-index:2147483000;display:flex;padding:16px;pointer-events:none;--wlkr-toaster-dir:1;--wlkr-toaster-ok:var(--brand,#33f282);--wlkr-toaster-bad:#ff938a}
.dark .wlkr-toaster{--wlkr-toaster-ok:#087d3d;--wlkr-toaster-bad:#b42318}
.wlkr-toaster[data-y=bottom]{bottom:0}
.wlkr-toaster[data-y=top]{top:0;--wlkr-toaster-dir:-1}
.wlkr-toaster[data-x=right]{right:0}
.wlkr-toaster[data-x=left]{left:0}
.wlkr-toaster[data-x=center]{left:0;right:0;justify-content:center}
.wlkr-toaster-list{position:relative;display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.wlkr-toaster[data-y=top] .wlkr-toaster-list{flex-direction:column-reverse}
.wlkr-toaster-item{width:min(360px,calc(100vw - 32px));pointer-events:auto}
.wlkr-toaster-item[inert]{pointer-events:none}
.wlkr-toaster-toast{position:relative;display:flex;align-items:flex-start;box-sizing:border-box;min-height:44px;padding:0 5px 0 14px;border-radius:0;background:var(--foreground,#010101);color:var(--background,#fff);font-size:14px;line-height:20px;touch-action:pan-y;translate:var(--wlkr-toaster-dx,0px) 0;transition:translate 320ms cubic-bezier(.3,1.4,.5,1);animation:wlkr-toaster-in 260ms cubic-bezier(.2,.7,.2,1)}
.wlkr-toaster-toast[data-dragging]{transition:none;user-select:none;-webkit-user-select:none}
.wlkr-toaster-toast[data-leaving=drop]{animation:wlkr-toaster-drop ${EXIT}ms cubic-bezier(.4,0,1,1) forwards}
.wlkr-toaster-toast[data-leaving=left]{animation:wlkr-toaster-left ${EXIT}ms cubic-bezier(.4,0,1,1) forwards}
.wlkr-toaster-toast[data-leaving=right]{animation:wlkr-toaster-right ${EXIT}ms cubic-bezier(.4,0,1,1) forwards}
.wlkr-toaster-tone{flex:none;width:8px;height:8px;margin:23px 10px 0 0}
.wlkr-toaster-tone[data-tone=success]{background:var(--wlkr-toaster-ok)}
.wlkr-toaster-tone[data-tone=error]{background:var(--wlkr-toaster-bad)}
.wlkr-toaster-body{flex:1 1 auto;min-width:0;padding:17px 0;overflow-wrap:anywhere}
.wlkr-toaster-description{display:block;margin-top:2px;font-size:13px;line-height:18px;opacity:.7}
.wlkr-toaster-toast button{flex:none;min-height:44px;margin:5px 0 0;border:0;border-radius:0;background:none;color:inherit;font:inherit;cursor:pointer;touch-action:manipulation}
.wlkr-toaster-toast button:focus-visible{outline:2px solid var(--background,#fff);outline-offset:3px}
.wlkr-toaster-toast .wlkr-toaster-action{margin-left:8px;padding:0 8px;font-size:13px;font-weight:500;text-decoration:underline;text-underline-offset:3px}
.wlkr-toaster-close{display:grid;place-items:center;width:44px;padding:0;opacity:.7}
.wlkr-toaster-close:hover{opacity:1}
.wlkr-toaster-close svg{width:16px;height:16px}
.wlkr-toaster-timer{position:absolute;left:14px;right:14px;bottom:6px;display:flex;justify-content:space-between;pointer-events:none}
.wlkr-toaster-timer>span{width:3px;height:3px;background:currentColor;opacity:clamp(.2,calc(var(--wlkr-toaster-on,${CELLS}) - var(--wlkr-toaster-i)),1)}
@keyframes wlkr-toaster-in{from{opacity:0;transform:translateY(calc(var(--wlkr-toaster-dir) * (100% + 16px)))}}
@keyframes wlkr-toaster-drop{to{opacity:0;transform:translateY(calc(var(--wlkr-toaster-dir) * 12px))}}
@keyframes wlkr-toaster-left{to{opacity:0;transform:translateX(-100%)}}
@keyframes wlkr-toaster-right{to{opacity:0;transform:translateX(100%)}}
@keyframes wlkr-toaster-fade-in{from{opacity:0}}
@keyframes wlkr-toaster-fade-out{to{opacity:0}}
@media(prefers-reduced-motion:reduce){.wlkr-toaster-toast{transition:none;animation-name:wlkr-toaster-fade-in}.wlkr-toaster-toast[data-leaving]{animation-name:wlkr-toaster-fade-out}}
`

const cells = Array.from({ length: CELLS }, (_, index) => <span key={index} style={{ "--wlkr-toaster-i": index } as React.CSSProperties} />)

/** Renders the toast stack. Mount one, anywhere; call `toast()` from anywhere. */
export function Toaster({ position = "bottom-right", max = 3, label = "Notifications", className, ...props }: ToasterProps) {
  const all = React.useSyncExternalStore(subscribe, () => toasts, () => EMPTY)
  const limit = Math.round(Number.isFinite(Number(max)) ? Math.min(6, Math.max(1, Number(max))) : 3)
  const [y, x] = (POSITIONS.includes(position) ? position : "bottom-right").split("-")
  const section = React.useRef<HTMLElement>(null)
  const list = React.useRef<HTMLOListElement>(null)
  const pointer = React.useRef({ type: "mouse", down: false })
  const returnTo = React.useRef<HTMLElement | null>(null)
  const tops = React.useRef(new Map<string, number>())
  const drag = React.useRef<{ id: string; pointer: number; x: number; y: number; dx: number; time: number; speed: number; active: boolean } | null>(null)
  const limitRef = React.useRef(limit)
  React.useEffect(() => { limitRef.current = limit })

  const active = all.filter(item => !item.leaving)
  const hidden = new Set(active.slice(0, Math.max(0, active.length - limit)).map(item => item.id))
  const shown = all.filter(item => !hidden.has(item.id))

  React.useEffect(() => {
    let raf = 0
    let last = 0
    const tick = (now: number) => {
      const elapsed = Math.min(100, now - last)
      last = now
      const root = section.current
      const listElement = list.current
      const paused = document.hidden || pointer.current.down || (pointer.current.type !== "touch" && !!listElement?.matches(":hover")) || !!root?.contains(document.activeElement)
      const live = toasts.filter(item => !item.leaving)
      live.slice(0, Math.max(0, live.length - limitRef.current)).forEach(item => close(item.id))
      for (const item of live.slice(-limitRef.current)) {
        if (item.duration === Infinity) continue
        const left = (remaining.get(item.id) ?? item.duration) - (paused ? 0 : elapsed)
        if (left <= 0) { close(item.id); continue }
        remaining.set(item.id, left)
        const on = String(Math.ceil((left / item.duration) * CELLS))
        const element = listElement?.querySelector<HTMLElement>(`[data-toast-id="${CSS.escape(item.id)}"]`)
        if (element && element.style.getPropertyValue("--wlkr-toaster-on") !== on) element.style.setProperty("--wlkr-toaster-on", on)
      }
      raf = toasts.some(item => !item.leaving && item.duration !== Infinity) ? requestAnimationFrame(tick) : 0
    }
    const wake = () => { if (!raf && toasts.some(item => !item.leaving)) { last = performance.now(); raf = requestAnimationFrame(tick) } }
    const unsubscribe = subscribe(wake)
    wake()
    return () => { unsubscribe(); cancelAnimationFrame(raf) }
  }, [])

  React.useLayoutEffect(() => {
    const listElement = list.current
    if (!listElement) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const next = new Map<string, number>()
    for (const element of Array.from(listElement.children) as HTMLElement[]) {
      const id = element.dataset.toastId ?? ""
      const before = tops.current.get(id)
      next.set(id, element.offsetTop)
      if (!still && before !== undefined && before !== element.offsetTop) element.animate([{ translate: `0 ${before - element.offsetTop}px` }, { translate: "0 0" }], { duration: 260, easing: "cubic-bezier(.2,.7,.2,1)" })
    }
    tops.current = next
  })

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    props.onKeyDown?.(event)
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-toast-id]")
    if (event.key !== "Escape" || !item || !list.current) return
    event.preventDefault()
    const items = Array.from(list.current.querySelectorAll<HTMLElement>("[data-toast-id]:not([inert])"))
    const index = items.indexOf(item)
    const next = (items[index + 1] ?? items[index - 1])?.querySelector("button")
    close(item.dataset.toastId ?? "")
    if (next) next.focus()
    else if (returnTo.current?.isConnected) returnTo.current.focus()
    else (document.activeElement as HTMLElement | null)?.blur()
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current
    if (!state || state.pointer !== event.pointerId) return
    drag.current = null
    const element = event.currentTarget
    if (!state.active) return
    delete element.dataset.dragging
    const far = Math.abs(state.dx) > element.offsetWidth * 0.4
    const flick = Math.abs(state.dx) > 24 && Math.abs(state.speed) > 0.6 && Math.sign(state.speed) === Math.sign(state.dx)
    if (event.type === "pointerup" && (far || flick)) close(state.id, state.dx < 0 ? "left" : "right")
    else element.style.setProperty("--wlkr-toaster-dx", "0px")
  }

  return (
    <section
      {...props}
      ref={section}
      aria-label={label}
      data-x={x}
      data-y={y}
      className={cn("wlkr-toaster", className)}
      onKeyDown={onKeyDown}
      onFocus={event => { props.onFocus?.(event); if (!event.currentTarget.contains(event.relatedTarget)) returnTo.current = event.relatedTarget as HTMLElement | null }}
    >
      <style>{styles}</style>
      <ol
        ref={list}
        className="wlkr-toaster-list"
        onPointerMove={event => { pointer.current.type = event.pointerType }}
        onPointerDown={event => { pointer.current = { type: event.pointerType, down: event.pointerType === "touch" } }}
        onPointerUp={() => { pointer.current.down = false }}
        onPointerCancel={() => { pointer.current.down = false }}
      >
        {shown.map(item => (
          <li key={item.id} data-toast-id={item.id} className="wlkr-toaster-item" inert={!!item.leaving} aria-hidden={item.leaving ? true : undefined}>
            <div
              role={item.tone === "error" ? "alert" : "status"}
              aria-atomic="true"
              className="wlkr-toaster-toast"
              data-leaving={item.leaving || undefined}
              onPointerDown={event => {
                if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return
                drag.current = { id: item.id, pointer: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, time: event.timeStamp, speed: 0, active: false }
              }}
              onPointerMove={event => {
                const state = drag.current
                if (!state || state.pointer !== event.pointerId) return
                const dx = event.clientX - state.x
                const dy = event.clientY - state.y
                if (!state.active) {
                  if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag.current = null; return }
                  if (Math.abs(dx) < 6) return
                  state.active = true
                  event.currentTarget.dataset.dragging = ""
                  window.getSelection()?.removeAllRanges()
                  try { event.currentTarget.setPointerCapture(event.pointerId) } catch {}
                }
                state.speed = (dx - state.dx) / Math.max(1, event.timeStamp - state.time)
                state.dx = dx
                state.time = event.timeStamp
                event.currentTarget.style.setProperty("--wlkr-toaster-dx", `${dx}px`)
              }}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {item.tone !== "default" && <span className="wlkr-toaster-tone" data-tone={item.tone} aria-hidden="true" />}
              <div className="wlkr-toaster-body">
                {item.message}
                {item.description && <span className="wlkr-toaster-description">{item.description}</span>}
              </div>
              {item.action && <button type="button" className="wlkr-toaster-action" onClick={() => { item.action?.onClick(); close(item.id) }}>{item.action.label}</button>}
              <button type="button" className="wlkr-toaster-close" aria-label="Dismiss" onClick={() => close(item.id)}><X aria-hidden="true" /></button>
              {item.duration !== Infinity && <span className="wlkr-toaster-timer" aria-hidden="true">{cells}</span>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
