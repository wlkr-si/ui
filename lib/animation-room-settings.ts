export type AnimationRoomSettings = {
  version: 2
  duration: number
  size: number
  openingDistance: number
  splitRadius: number
  openingAngle: number
  openAt: number
  closeAt: number
  arcScale: number
  cutGap: number
  tilt: number
  reverse: boolean
  cutThrough: boolean
  guides: boolean
  easing: "linear" | "smooth"
  background: "light" | "dark" | "checkerboard"
  view: "loader" | "wordmark"
  playback: "loop" | "hover"
  frame: number
}
export const defaultAnimationSettings: AnimationRoomSettings = {
  version: 2, duration: 1800, size: 200, openingDistance: 64, splitRadius: 74, openingAngle: 0, openAt: 10, closeAt: 350, arcScale: 1, cutGap: 0, tilt: -24, reverse: false,
  cutThrough: true, guides: false, easing: "linear", background: "light", view: "loader", playback: "loop", frame: 0,
}
const ranges = { duration: [800, 10000], size: [48, 240], arcScale: [.6, 1.2], cutGap: [0, 24], tilt: [-60, 60], frame: [0, 360], openingDistance: [0, 100], splitRadius: [40, 100], openingAngle: [-90, 90], openAt: [0, 120], closeAt: [240, 360] } as const
export function validateAnimationSettings(value: unknown): AnimationRoomSettings | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const data = value as Record<string, unknown>
  const keys = Object.keys(defaultAnimationSettings)
  if (Object.keys(data).length !== keys.length || Object.keys(data).some(key => !keys.includes(key)) || data.version !== 2) return null
  for (const [key, [min, max]] of Object.entries(ranges)) if (typeof data[key] !== "number" || !Number.isFinite(data[key]) || (data[key] as number) < min || (data[key] as number) > max) return null
  for (const key of ["reverse", "cutThrough", "guides"]) if (typeof data[key] !== "boolean") return null
  if (!["linear", "smooth"].includes(data.easing as string) || !["light", "dark", "checkerboard"].includes(data.background as string) || !["loader", "wordmark"].includes(data.view as string) || !["loop", "hover"].includes(data.playback as string)) return null
  return Object.fromEntries(keys.map(key => [key, data[key]])) as AnimationRoomSettings
}
export function animationSettingsHash(settings: AnimationRoomSettings): string {
  const safe = validateAnimationSettings(settings)
  if (!safe) throw new Error("Invalid animation settings")
  return `#motion=${encodeURIComponent(JSON.stringify(safe))}`
}
export function parseAnimationSettingsHash(hash: string): AnimationRoomSettings | null {
  if (typeof hash !== "string" || hash.length > 8192 || !hash.startsWith("#motion=")) return null
  try {
    const text = decodeURIComponent(hash.slice(8))
    if (text.length > 2048) return null
    const value = JSON.parse(text)
    if (value && typeof value === "object" && !Array.isArray(value) && value.version === 1) {
      const added = ["openingDistance", "splitRadius", "openingAngle", "openAt", "closeAt"]
      const legacyKeys = Object.keys(defaultAnimationSettings).filter(key => !added.includes(key))
      if (Object.keys(value).length !== legacyKeys.length || Object.keys(value).some(key => !legacyKeys.includes(key))) return null
      const migrated = validateAnimationSettings({ ...defaultAnimationSettings, ...value, version: 2 })
      // Version one used cutGap as a painted-cut clearance, not a resting physical gap.
      return migrated ? { ...migrated, cutGap: 0 } : null
    }
    return validateAnimationSettings(value)
  } catch { return null }
}
