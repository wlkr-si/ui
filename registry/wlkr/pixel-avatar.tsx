"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type PixelAvatarProps = Omit<React.ComponentPropsWithoutRef<"span">, "children" | "role"> & {
  /** Any string: a name, an email, an id. The same seed always draws the same face. */
  seed: string
  /** Width and height in pixels, 16–256. */
  size?: number
  /** Cells across the face. */
  grid?: 5 | 7
  shape?: "square" | "round"
  /** Optional image, shown once it has loaded. The pixels stay on error. */
  src?: string
  alt?: string
  /** Accessible name. Defaults to `alt`, then `seed`. */
  label?: string
  /** `auto` picks ink, brand or ink with one brand cell from the seed. */
  tone?: "auto" | "ink" | "brand"
}

export type PixelAvatarGroupProps = Omit<React.ComponentPropsWithoutRef<"div">, "role"> & {
  /** Avatars to stack, usually `PixelAvatar` elements. */
  children: React.ReactNode
  /** Avatars shown before the rest collapse into a "+N" tile, 1–99. */
  max?: number
  /** Size given to avatars that do not set their own. */
  size?: number
  /** Accessible name for the group. */
  label?: string
}

const styles = `
.wlkr-pixel-avatar{position:relative;display:inline-block;flex:none;overflow:hidden;border-radius:2px;background:var(--muted,#f3f3f3);vertical-align:middle;line-height:0}
.wlkr-pixel-avatar[data-shape=round]{border-radius:50%}
.wlkr-pixel-avatar-face{display:block;width:100%;height:100%}
.wlkr-pixel-avatar-ink{fill:var(--foreground,currentColor)}
.wlkr-pixel-avatar-brand{fill:var(--brand,#33f282)}
.wlkr-pixel-avatar-cover{fill:var(--muted,#f3f3f3);animation:wlkr-pixel-avatar-on steps(1,end) forwards}
@keyframes wlkr-pixel-avatar-on{from{opacity:1}to{opacity:0}}
.wlkr-pixel-avatar-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 220ms cubic-bezier(.2,.7,.2,1)}
.wlkr-pixel-avatar-image[data-loaded=true]{opacity:1}
.wlkr-pixel-avatar-group{display:inline-flex;align-items:center;max-width:100%;padding-inline-end:calc(var(--wlkr-pixel-avatar-count) * 4px)}
.wlkr-pixel-avatar-group-item{display:inline-flex;transition:transform 180ms cubic-bezier(.2,.7,.2,1) calc(var(--wlkr-pixel-avatar-index) * 24ms)}
.wlkr-pixel-avatar-group-item+.wlkr-pixel-avatar-group-item{margin-inline-start:calc(var(--wlkr-pixel-avatar-size) * -.28)}
.wlkr-pixel-avatar-group-item>*{outline:2px solid var(--background,#fff)}
.wlkr-pixel-avatar-more{display:inline-grid;place-items:center;border-radius:2px;background:var(--muted,#f3f3f3);color:var(--muted-foreground,#696969);font-size:12px;line-height:1;font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
@media(hover:hover) and (pointer:fine){.wlkr-pixel-avatar-group:is(:hover,:focus-within) .wlkr-pixel-avatar-group-item{transform:translateX(calc(var(--wlkr-pixel-avatar-index) * 4px))}}
@media(prefers-reduced-motion:reduce){.wlkr-pixel-avatar-cover{display:none}.wlkr-pixel-avatar-image,.wlkr-pixel-avatar-group-item{transition:none}.wlkr-pixel-avatar-group:is(:hover,:focus-within) .wlkr-pixel-avatar-group-item{transform:none}}
`

/** 4×4 ordered-dither thresholds: the order cells switch on in. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const ENTRANCE_MS = 250

const clamp = (input: unknown, min: number, max: number, fallback: number) => {
  const number = Number(input)
  return input === "" || input === null || !Number.isFinite(number) ? fallback : Math.min(max, Math.max(min, number))
}
const cell = (x: number, y: number) => `M${x} ${y}h1v1h-1z`

/** FNV-1a string hash, then mulberry32: deterministic, so server and client draw the same face. */
function random(seed: string) {
  let state = 0x811c9dc5
  for (const character of seed) state = Math.imul(state ^ (character.codePointAt(0) ?? 0), 0x01000193)
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

function draw(seed: string, grid: number, tone: "auto" | "ink" | "brand") {
  const next = random(seed)
  const half = Math.ceil(grid / 2)
  const centre = half - 1
  const target = Math.round(grid * grid * (0.42 + next() * 0.16))
  const order = Array.from({ length: grid * half }, (_, index) => ({ index, weight: next() })).sort((a, b) => a.weight - b.weight)
  const on = new Set<number>()
  let count = 0
  for (const { index } of order) {
    const cost = index % half === centre ? 1 : 2
    if (count + cost > target) continue
    on.add(index)
    count += cost
  }
  const pick = tone === "auto" ? (["ink", "brand", "accent"] as const)[Math.floor(next() * 3)] : tone
  let accent: number | null = null
  if (pick === "accent") {
    const middle = Math.floor(grid / 2)
    const rows = Array.from({ length: grid }, (_, row) => row).sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle))
    accent = (rows.find(row => on.has(row * half + centre)) ?? middle) * half + centre
    on.add(accent)
  }
  let path = ""
  for (const index of on) {
    if (index === accent) continue
    const x = index % half
    const y = Math.floor(index / half)
    path += cell(x, y) + (x === centre ? "" : cell(grid - 1 - x, y))
  }
  return { path, accent: accent === null ? null : cell(centre, Math.floor(accent / half)), tone: pick === "brand" ? "brand" : "ink" }
}

function covers(grid: number) {
  const paths = ["", "", "", ""]
  for (let y = 0; y < grid; y++) for (let x = 0; x < grid; x++) paths[BAYER[(y % 4) * 4 + (x % 4)] >> 2] += cell(x, y)
  return paths
}

/** A symmetric pixel face drawn from any string, the same every time. An image covers it once loaded. */
export function PixelAvatar({ seed, size = 40, grid = 5, shape = "square", src, alt, label, tone = "auto", className, style, ...props }: PixelAvatarProps) {
  const text = typeof seed === "string" ? seed : ""
  const cells = grid === 7 ? 7 : 5
  const pixels = Math.round(clamp(size, 16, 256, 40))
  const face = React.useMemo(() => draw(text, cells, tone === "ink" || tone === "brand" ? tone : "auto"), [text, cells, tone])
  const cover = React.useMemo(() => covers(cells), [cells])
  const [loadedSrc, setLoadedSrc] = React.useState<string | null>(null)
  const loaded = Boolean(src) && loadedSrc === src
  const markCached = React.useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) setLoadedSrc(image.getAttribute("src"))
  }, [])
  const pad = shape === "round" ? 1.5 : 1
  const name = label ?? alt ?? (text || "Avatar")
  return (
    <span {...props} role="img" aria-label={name} data-shape={shape === "round" ? "round" : "square"} className={cn("wlkr-pixel-avatar", className)} style={{ width: pixels, height: pixels, ...style }}>
      <style>{styles}</style>
      <svg className="wlkr-pixel-avatar-face" viewBox={`${-pad} ${-pad} ${cells + pad * 2} ${cells + pad * 2}`} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        <path className={face.tone === "brand" ? "wlkr-pixel-avatar-brand" : "wlkr-pixel-avatar-ink"} d={face.path} />
        {face.accent && <path className="wlkr-pixel-avatar-brand" d={face.accent} />}
        {cover.map((d, step) => <path key={step} className="wlkr-pixel-avatar-cover" d={d} style={{ animationDuration: `${((step + 1) * ENTRANCE_MS) / 4}ms` }} />)}
      </svg>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} ref={markCached} className="wlkr-pixel-avatar-image" src={src} alt="" data-loaded={loaded} onLoad={() => setLoadedSrc(src)} />
      )}
    </span>
  )
}

/** Overlapping avatars; the ones past `max` collapse into a "+N" tile. */
export function PixelAvatarGroup({ children, max = 4, size, label, className, style, ...props }: PixelAvatarGroupProps) {
  const avatars = React.Children.toArray(children).filter((child): child is React.ReactElement<PixelAvatarProps> => React.isValidElement(child))
  const limit = Math.round(clamp(max, 1, 99, 4))
  const pixels = Math.round(clamp(size, 16, 256, 40))
  const shown = avatars.slice(0, limit)
  const extra = avatars.length - shown.length
  const items = [...shown.map(avatar => size === undefined || avatar.props.size !== undefined ? avatar : React.cloneElement(avatar, { size: pixels })), ...(extra > 0 ? [<span key="more" role="img" aria-label={`${extra} more`} className="wlkr-pixel-avatar-more" style={{ width: pixels, height: pixels }}>+{extra}</span>] : [])]
  const vars = { "--wlkr-pixel-avatar-size": `${pixels}px`, "--wlkr-pixel-avatar-count": Math.max(0, items.length - 1) } as React.CSSProperties
  return (
    <div {...props} role="group" aria-label={label} className={cn("wlkr-pixel-avatar-group", className)} style={{ ...vars, ...style }}>
      <style>{styles}</style>
      {items.map((item, index) => <span key={item.key ?? index} className="wlkr-pixel-avatar-group-item" style={{ "--wlkr-pixel-avatar-index": index } as React.CSSProperties}>{item}</span>)}
    </div>
  )
}
