export type AnimationRoomSettings = {
  version: 3
  duration: number
  size: number
  openingDistance: number
  splitRadius: number
  goo: number
  squish: number
  ripple: number
  arcScale: number
  tilt: number
  reverse: boolean
  cutThrough: boolean
  guides: boolean
  easing: "linear" | "smooth"
  background: "light" | "dark" | "checkerboard"
  view: "loader" | "wordmark"
  playback: "loop" | "hover" | "bounce"
  frame: number
}
/** Hovers run quicker than the continuous loading loop: a full pass, and a short bounce. */
export const hoverDuration = 650
export const bounceDuration = 350
export const defaultAnimationSettings: AnimationRoomSettings = {
  version: 3, duration: 1800, size: 200, openingDistance: 40, splitRadius: 74, goo: 11, squish: .7, ripple: .22, arcScale: 1, tilt: -24, reverse: false,
  cutThrough: true, guides: false, easing: "linear", background: "light", view: "loader", playback: "loop", frame: 0,
}
const ranges = { duration: [300, 10000], size: [48, 240], arcScale: [.6, 1.2], tilt: [-60, 60], frame: [0, 360], openingDistance: [0, 100], splitRadius: [40, 100], goo: [0, 24], squish: [0, 1], ripple: [0, 1] } as const
export function validateAnimationSettings(value: unknown): AnimationRoomSettings | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const data = value as Record<string, unknown>
  const keys = Object.keys(defaultAnimationSettings)
  if (Object.keys(data).length !== keys.length || Object.keys(data).some(key => !keys.includes(key)) || data.version !== 3) return null
  for (const [key, [min, max]] of Object.entries(ranges)) if (typeof data[key] !== "number" || !Number.isFinite(data[key]) || (data[key] as number) < min || (data[key] as number) > max) return null
  for (const key of ["reverse", "cutThrough", "guides"]) if (typeof data[key] !== "boolean") return null
  if (!["linear", "smooth"].includes(data.easing as string) || !["light", "dark", "checkerboard"].includes(data.background as string) || !["loader", "wordmark"].includes(data.view as string) || !["loop", "hover", "bounce"].includes(data.playback as string)) return null
  return Object.fromEntries(keys.map(key => [key, data[key]])) as AnimationRoomSettings
}
export function animationSettingsHash(settings: AnimationRoomSettings): string {
  const safe = validateAnimationSettings(settings)
  if (!safe) throw new Error("Invalid animation settings")
  return `#motion=${encodeURIComponent(JSON.stringify(safe))}`
}
// Older links tuned rigid pieces; they keep their shared look and playback but take the liquid defaults.
const shared = ["duration", "size", "arcScale", "tilt", "reverse", "cutThrough", "guides", "easing", "background", "view", "playback", "frame"]
const legacyKeys = { 1: [...shared, "version", "cutGap"], 2: [...shared, "version", "cutGap", "openingDistance", "splitRadius", "openingAngle", "openAt", "closeAt"] } as const
export function parseAnimationSettingsHash(hash: string): AnimationRoomSettings | null {
  if (typeof hash !== "string" || hash.length > 8192 || !hash.startsWith("#motion=")) return null
  try {
    const text = decodeURIComponent(hash.slice(8))
    if (text.length > 2048) return null
    const value = JSON.parse(text)
    if (value && typeof value === "object" && !Array.isArray(value) && (value.version === 1 || value.version === 2)) {
      const expected: readonly string[] = legacyKeys[value.version as 1 | 2]
      if (Object.keys(value).length !== expected.length || Object.keys(value).some(key => !expected.includes(key))) return null
      return validateAnimationSettings({ ...defaultAnimationSettings, ...Object.fromEntries(shared.map(key => [key, value[key]])) })
    }
    return validateAnimationSettings(value)
  } catch { return null }
}
