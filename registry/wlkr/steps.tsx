"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type StepItem = { label: string; description?: string }

export type StepsProps = Omit<React.HTMLAttributes<HTMLElement>, "children" | "aria-label"> & {
  items: StepItem[]
  /** Zero-based index of the active step. `items.length` or more means every step is complete. */
  current: number
  /** Makes completed steps and the current one buttons that jump back to them. */
  onStepSelect?: (index: number) => void
  /** Lets upcoming steps be selected too. */
  allowForward?: boolean
  /** Horizontal stacks to vertical when its container is narrower than 420px. */
  orientation?: "horizontal" | "vertical"
  /** Accessible name for the list. */
  label?: string
}

type State = "complete" | "current" | "upcoming"

const styles = `
.wlkr-steps{container:wlkr-steps/inline-size;display:block;width:100%;color:var(--foreground,currentColor)}
.wlkr-steps-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.wlkr-steps-item{position:relative;display:grid;grid-template-columns:minmax(0,max-content);min-width:0;margin:0;padding:0 0 20px}
.wlkr-steps-item:last-child{padding-bottom:0}
.wlkr-steps-track{position:absolute;left:11px;top:32px;bottom:8px;width:2px;overflow:hidden;background:var(--border,#dedede)}
.wlkr-steps-fill{position:absolute;inset:0;background:var(--foreground,currentColor);transform-origin:0 0;transform:scaleY(var(--wlkr-steps-fill,0));transition:transform 450ms steps(8,end)}
.wlkr-steps-step{grid-area:1/1;display:flex;align-items:flex-start;gap:12px;min-width:44px;min-height:44px}
.wlkr-steps-hit{grid-area:1/1;position:relative;z-index:1;min-width:44px;min-height:44px;margin:0;padding:0;border:0;border-radius:2px;background:none;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.wlkr-steps-hit:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:4px}
.wlkr-steps-marker{flex:none;box-sizing:border-box;width:24px;height:24px;overflow:hidden;border:1px solid var(--border,#dedede);border-radius:2px;color:var(--muted-foreground,#696969);font-size:12px;font-weight:500;line-height:1;font-variant-numeric:tabular-nums;font-feature-settings:"tnum";transition:background-color 1ms steps(1,end) var(--wlkr-steps-delay),border-color 1ms steps(1,end) var(--wlkr-steps-delay),color 1ms steps(1,end) var(--wlkr-steps-delay)}
.wlkr-steps-item[data-state=current] .wlkr-steps-marker{border-color:var(--brand,#33f282);background:var(--brand,#33f282);color:var(--brand-foreground,#010101)}
.wlkr-steps-item[data-state=complete] .wlkr-steps-marker{border-color:var(--foreground,currentColor);background:var(--foreground,currentColor);color:var(--background,#fff)}
.wlkr-steps-face{display:flex;flex-direction:column;transition:transform 450ms cubic-bezier(.2,.7,.2,1) var(--wlkr-steps-delay)}
.wlkr-steps-face>*{display:flex;flex:none;align-items:center;justify-content:center;height:22px}
.wlkr-steps-item[data-state=complete] .wlkr-steps-face{transform:translateY(-22px)}
.wlkr-steps-tick{display:block;width:14px;height:14px;fill:currentColor}
.wlkr-steps-text{display:block;min-width:0;padding-top:2px}
.wlkr-steps-label{display:block;font-size:14px;line-height:20px;font-weight:500;letter-spacing:-.01em;overflow-wrap:anywhere;color:var(--muted-foreground,#696969);transition:color 1ms steps(1,end) var(--wlkr-steps-delay)}
.wlkr-steps-item[data-state=current] .wlkr-steps-label{color:var(--foreground,currentColor)}
@media(hover:hover){.wlkr-steps-hit:hover+.wlkr-steps-step .wlkr-steps-label{color:var(--foreground,currentColor)}}
.wlkr-steps-description{display:block;margin-top:2px;font-size:12px;line-height:1.4;color:var(--muted-foreground,#696969)}
.wlkr-steps-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@container wlkr-steps (min-width:420px){
.wlkr-steps[data-orientation=horizontal] .wlkr-steps-list{flex-direction:row}
.wlkr-steps[data-orientation=horizontal] .wlkr-steps-item{flex:1 1 0;padding:0 12px 0 0}
.wlkr-steps[data-orientation=horizontal] .wlkr-steps-track{left:32px;right:8px;top:11px;bottom:auto;width:auto;height:2px}
.wlkr-steps[data-orientation=horizontal] .wlkr-steps-fill{transform:scaleX(var(--wlkr-steps-fill,0))}
.wlkr-steps[data-orientation=horizontal] .wlkr-steps-step{flex-direction:column;gap:10px}
.wlkr-steps[data-orientation=horizontal] .wlkr-steps-text{padding-top:0}
}
@media(prefers-reduced-motion:reduce){.wlkr-steps .wlkr-steps-fill,.wlkr-steps .wlkr-steps-marker,.wlkr-steps .wlkr-steps-face,.wlkr-steps .wlkr-steps-label{transition:none}}
`
const STEP = 450
const SPOKEN: Record<State, string> = { complete: "Completed: ", current: "Current: ", upcoming: "Not started: " }
const TICK = "M0 3h1v1H0zM1 4h1v1H1zM2 5h1v1H2zM3 4h1v1H3zM4 3h1v1H4zM5 2h1v1H5zM6 1h1v1H6z"
const KEYS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/** A numbered row of steps joined by a line that fills in pixel increments as `current` advances. */
export function Steps({ items, current, onStepSelect, allowForward = false, orientation = "horizontal", label = "Progress", className, onKeyDown, ...props }: StepsProps) {
  const list = Array.isArray(items) ? items : []
  const count = list.length
  const requested = Number(current)
  const active = Number.isFinite(requested) ? Math.min(count, Math.max(0, Math.floor(requested))) : 0
  // Remember where the last move started, so the fill and each marker can be timed from it.
  const [motion, setMotion] = React.useState({ active, from: active })
  if (motion.active !== active) setMotion({ active, from: motion.active })
  // Leaving the all-complete state starts at the last real step.
  const from = Math.min(motion.from, Math.max(0, count - 1))
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([])
  const id = React.useId()
  const interactive = typeof onStepSelect === "function"
  const enabled = (index: number) => interactive && (index <= active || allowForward)
  const Root = interactive ? "nav" : "div"

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event)
    const at = buttons.current.indexOf(event.target as HTMLButtonElement)
    if (event.defaultPrevented || at < 0) return
    const order = list.flatMap((_, index) => enabled(index) ? [index] : [])
    const position = order.indexOf(at)
    let target: number | undefined
    if (event.key === "Home") target = order[0]
    else if (event.key === "End") target = order[order.length - 1]
    else if (event.key in KEYS) target = order[Math.min(order.length - 1, Math.max(0, position + KEYS[event.key]))]
    if (target === undefined) return
    event.preventDefault()
    buttons.current[target]?.focus()
  }

  return (
    <Root {...props} aria-label={interactive ? label : undefined} className={cn("wlkr-steps", className)} data-orientation={orientation === "vertical" ? "vertical" : "horizontal"} onKeyDown={handleKeyDown}>
      <style>{styles}</style>
      <ol className="wlkr-steps-list" aria-label={interactive ? undefined : label}>
        {list.map((item, index) => {
          const state: State = index < active ? "complete" : index === active ? "current" : "upcoming"
          const moved = index >= Math.min(from, active) && index <= Math.max(from, active)
          const fillDelay = Math.max(0, active > from ? index - from : from - 1 - index) * STEP
          const step = state === "current" ? "step" as const : undefined
          const button = enabled(index)
          // The button overlays the step instead of wrapping it, so the marker never remounts and its transitions play.
          return (
            <li key={index} className="wlkr-steps-item" data-state={state} aria-current={button ? undefined : step} style={{ "--wlkr-steps-delay": `${moved ? Math.abs(index - from) * STEP : 0}ms` } as React.CSSProperties}>
              {index < count - 1 && <span className="wlkr-steps-track" aria-hidden="true"><span className="wlkr-steps-fill" style={{ "--wlkr-steps-fill": index < active ? 1 : 0, transitionDelay: `${fillDelay}ms` } as React.CSSProperties} /></span>}
              {button && <button ref={node => { buttons.current[index] = node }} type="button" className="wlkr-steps-hit" aria-labelledby={`${id}-${index}`} aria-current={step} onClick={() => onStepSelect?.(index)} />}
              <span className="wlkr-steps-step" aria-hidden={button || undefined}>
                <span className="wlkr-steps-marker" aria-hidden="true">
                  <span className="wlkr-steps-face">
                    <span>{index + 1}</span>
                    <span><svg className="wlkr-steps-tick" viewBox="0 0 7 7" shapeRendering="crispEdges" focusable="false"><path d={TICK} /></svg></span>
                  </span>
                </span>
                <span className="wlkr-steps-text" id={`${id}-${index}`}>
                  <span className="wlkr-steps-sr">{SPOKEN[state]}</span>
                  <span className="wlkr-steps-label">{item?.label}</span>
                  {item?.description && <span className="wlkr-steps-description">{item.description}</span>}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </Root>
  )
}
