"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height" | "className" | "tabIndex"> & {
  src: string
  alt: string
  /** Intrinsic size in CSS pixels. Sets the aspect ratio up front, so nothing moves when the image arrives. */
  width: number
  height: number
  /** Block sizes in CSS pixels, coarse to fine. 2–256, at most 12 entries. */
  steps?: number[]
  /** Milliseconds each step is held. 30–1000. */
  stepDuration?: number
  /** "both" plays when scrolled into view and replays on hover or focus. */
  trigger?: "view" | "hover" | "both"
  fit?: "cover" | "contain"
  /** Makes the frame focusable, so focus can replay the reveal. Not set by default. */
  tabIndex?: number
  className?: string
}
type Phase = "waiting" | "pixel" | "done" | "error"

const defaultSteps = [64, 40, 24, 14, 8, 4]
const reduceQuery = "(prefers-reduced-motion: reduce)"
const styles = `
.wlkr-pixel-image{position:relative;display:block;overflow:hidden;max-width:100%;border-radius:0}
:where(.wlkr-pixel-image){width:var(--wlkr-pixel-image-width)}
.wlkr-pixel-image:focus-visible{outline:2px solid var(--ring,currentColor);outline-offset:5px}
.wlkr-pixel-image-img{position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;margin:0;color:var(--muted-foreground,#696969)}
.wlkr-pixel-image-canvas{position:absolute;inset:0;display:block;width:100%;height:100%;opacity:0;pointer-events:none}
.wlkr-pixel-image[data-state=waiting]{background:var(--muted,#f3f3f3)}
.wlkr-pixel-image[data-state=waiting] .wlkr-pixel-image-img,.wlkr-pixel-image[data-state=pixel] .wlkr-pixel-image-img{opacity:0}
.wlkr-pixel-image[data-state=pixel] .wlkr-pixel-image-canvas{opacity:1}
@media(prefers-reduced-motion:reduce){.wlkr-pixel-image .wlkr-pixel-image-img{opacity:1}.wlkr-pixel-image .wlkr-pixel-image-canvas{display:none}}
`
const clamp = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback
const subscribeMotion = (onChange: () => void) => {
  const media = window.matchMedia(reduceQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

/** An image that arrives in pixels: huge colour blocks resolve through finer grids until the real image snaps in. */
export function PixelImage({ src, alt, width, height, steps = defaultSteps, stepDuration = 90, trigger = "view", fit = "cover", tabIndex, className, style, ...imgProps }: PixelImageProps) {
  const root = React.useRef<HTMLSpanElement>(null)
  const image = React.useRef<HTMLImageElement>(null)
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const motion = React.useSyncExternalStore(subscribeMotion, () => !window.matchMedia(reduceQuery).matches, () => false)
  const [status, setStatus] = React.useState<{ src: string; phase: Phase }>({ src, phase: "waiting" })
  const phase = status.src === src ? status.phase : "waiting"
  const w = clamp(Number(width), 1, 100000, 1)
  const h = clamp(Number(height), 1, 100000, 1)
  const sizes = (Array.isArray(steps) ? steps : []).map(Number).filter(Number.isFinite).slice(0, 12).map(size => clamp(size, 2, 256, 2))
  const stepKey = (sizes.length ? sizes : defaultSteps).join(",")
  const hold = clamp(Number(stepDuration), 30, 1000, 90)

  React.useEffect(() => {
    const frame = root.current, img = image.current, view = canvas.current
    const context = view?.getContext("2d")
    const scratch = document.createElement("canvas").getContext("2d")
    if (!motion || !frame || !img || !view || !context || !scratch) return
    const blocks = stepKey.split(",").map(Number)
    const onView = trigger !== "hover", onHover = trigger !== "view"
    let loaded = false, inView = false, played = false, step = -1, timer = 0, ratio = 1
    const set = (next: Phase) => setStatus({ src, phase: next })
    const draw = () => {
      const nw = img.naturalWidth, nh = img.naturalHeight, cw = view.width, ch = view.height
      if (step < 0 || !nw || !nh || !cw || !ch) return
      const scale = fit === "cover" ? Math.max(cw / nw, ch / nh) : Math.min(cw / nw, ch / nh)
      const source = fit === "cover" ? { x: (nw - cw / scale) / 2, y: (nh - ch / scale) / 2, w: cw / scale, h: ch / scale } : { x: 0, y: 0, w: nw, h: nh }
      const target = fit === "cover" ? { x: 0, y: 0, w: cw, h: ch } : { x: (cw - nw * scale) / 2, y: (ch - nh * scale) / 2, w: nw * scale, h: nh * scale }
      const block = blocks[step] * ratio
      const tiny = scratch.canvas
      tiny.width = Math.max(1, Math.ceil(target.w / block))
      tiny.height = Math.max(1, Math.ceil(target.h / block))
      scratch.imageSmoothingEnabled = true
      scratch.imageSmoothingQuality = "high"
      scratch.drawImage(img, source.x, source.y, source.w, source.h, 0, 0, tiny.width, tiny.height)
      context.clearRect(0, 0, cw, ch)
      context.imageSmoothingEnabled = false
      context.drawImage(tiny, target.x, target.y, target.w, target.h)
    }
    const resize = () => {
      const box = frame.getBoundingClientRect()
      ratio = Math.min(2, window.devicePixelRatio || 1)
      view.width = Math.round(box.width * ratio)
      view.height = Math.round(box.height * ratio)
      draw()
    }
    const advance = () => {
      timer = window.setTimeout(() => {
        step += 1
        if (step < blocks.length) { draw(); advance() } else { step = -1; set("done") }
      }, hold)
    }
    const play = () => {
      window.clearTimeout(timer)
      played = true; step = 0; draw(); set("pixel"); advance()
    }
    const onLoad = () => {
      loaded = true
      if (!onView) { set("done"); return }
      if (inView) { play(); return }
      step = 0; draw(); set("pixel")
    }
    const onError = () => { loaded = false; window.clearTimeout(timer); step = -1; set("error") }
    const replay = (event: Event) => {
      if (event instanceof PointerEvent && event.pointerType === "touch") return
      if (loaded) play()
    }
    const intersection = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting)
      if (inView && loaded && onView && !played) play()
    }, { threshold: .25 })
    const resizer = new ResizeObserver(resize)
    resize()
    resizer.observe(frame)
    if (onView) intersection.observe(frame)
    img.addEventListener("load", onLoad)
    img.addEventListener("error", onError)
    if (onHover) { frame.addEventListener("pointerenter", replay); frame.addEventListener("focusin", replay) }
    const cached = requestAnimationFrame(() => { if (img.complete && !loaded) { if (img.naturalWidth > 0) onLoad(); else if (img.currentSrc || img.getAttribute("src")) onError() } })
    return () => {
      cancelAnimationFrame(cached)
      window.clearTimeout(timer)
      intersection.disconnect()
      resizer.disconnect()
      img.removeEventListener("load", onLoad)
      img.removeEventListener("error", onError)
      frame.removeEventListener("pointerenter", replay)
      frame.removeEventListener("focusin", replay)
    }
  }, [src, motion, stepKey, hold, trigger, fit])

  return <span ref={root} className={cn("wlkr-pixel-image", className)} data-state={motion ? phase : "static"} tabIndex={tabIndex} style={{ aspectRatio: `${w} / ${h}`, "--wlkr-pixel-image-width": `${w}px`, ...style } as React.CSSProperties}>
    <style>{styles}</style>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img ref={image} {...imgProps} src={src} alt={alt} width={w} height={h} className="wlkr-pixel-image-img" style={{ objectFit: fit }} />
    <canvas ref={canvas} className="wlkr-pixel-image-canvas" aria-hidden="true" />
  </span>
}
