export type LensMotionOptions = {
  openingDistance?: number
  splitGap?: number
  openingAngle?: number
  openAt?: number
  closeAt?: number
}
export type LensPiecePose = {
  angle: number
  openness: number
  normal: { x: number; y: number }
  inner: { x: number; y: number }
  outer: { x: number; y: number }
}
export const lensClamp = (value: number, min: number, max: number, fallback: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback))
export const normalizeLensAngle = (angle: number) => ((angle % 360) + 360) % 360
const smoothstep = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t) }

/** Position-only rigid shifts. Zero resting gap closes the original body exactly at both endpoints. */
export function openLensPose(angle: number, options: LensMotionOptions = {}): LensPiecePose {
  const theta = normalizeLensAngle(Number.isFinite(angle) ? angle : 0)
  const distance = lensClamp(options.openingDistance ?? 64, 0, 100, 64)
  const gap = lensClamp(options.splitGap ?? 0, 0, 24, 0)
  const offset = lensClamp(options.openingAngle ?? 0, -90, 90, 0)
  const openAt = lensClamp(options.openAt ?? 10, 0, 120, 10)
  const closeAt = lensClamp(options.closeAt ?? 350, 240, 360, 350)
  const contact = (theta - openAt) / (closeAt - openAt)
  // Fast but velocity-continuous opening, a clear passage, then a soft settlement.
  const openness = contact <= 0 || contact >= 1 ? 0 : smoothstep(contact / .22) * smoothstep((1 - contact) / .22)
  const radians = (theta / 2 + offset) * Math.PI / 180
  const normal = { x: Math.cos(radians), y: Math.sin(radians) }
  const x = normal.x * distance * openness / 2
  const y = (normal.y * distance * openness + gap) / 2
  return { angle: theta, openness, normal, inner: { x: -x, y: -y }, outer: { x, y } }
}
const bezier = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3
/** CSS cubic-bezier(.77,0,.175,1): invert x before evaluating y. */
export function lensEase(progress: number, easing: "linear" | "smooth" = "linear"): number {
  const x = lensClamp(progress, 0, 1, 0)
  if (easing === "linear" || x === 0 || x === 1) return x
  let low = 0, high = 1
  for (let i = 0; i < 40; i++) { const t = (low + high) / 2; if (bezier(t, .77, .175) < x) low = t; else high = t }
  return bezier((low + high) / 2, 0, 1)
}
export function lensArcAngle(progress: number, startAngle = 0, reverse = false, easing: "linear" | "smooth" = "linear"): number {
  return lensClamp(startAngle, -36000, 36000, 0) + (reverse ? -360 : 360) * lensEase(progress, easing)
}
export function sampleLensMotion(options: LensMotionOptions, startAngle = 0, reverse = false, easing: "linear" | "smooth" = "linear", count = 720) {
  const steps = Math.floor(lensClamp(count, 16, 720, 720))
  return Array.from({ length: steps + 1 }, (_, index) => {
    const offset = index / steps
    const angle = lensArcAngle(offset, startAngle, reverse, easing)
    return { offset, angle, pose: openLensPose(angle, options) }
  })
}
