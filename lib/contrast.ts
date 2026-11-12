export type RGB = readonly [number, number, number]

export function parseOpaqueHex(value: string): RGB | null {
  if (!/^#[0-9a-f]{6}$/i.test(value)) return null
  return [1, 3, 5].map(index => Number.parseInt(value.slice(index, index + 2), 16)) as unknown as RGB
}

export function relativeLuminance(color: RGB): number {
  const linear = color.map(channel => {
    const srgb = channel / 255
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

export function contrastRatio(a: RGB, b: RGB): number {
  const first = relativeLuminance(a)
  const second = relativeLuminance(b)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

export function meets(ratio: number, threshold: number): boolean {
  return ratio >= threshold
}

export function canonicalHex(value: string, fallback: string): string {
  return parseOpaqueHex(value) ? value.toUpperCase() : fallback
}

export type AAOption = {
  color: string
  ratio: number
  direction: "Current" | "Toward black" | "Toward white"
}

const AA_NORMAL_TEXT = 4.5
const MIX_STEPS = 20
const OPTIONS_PER_DIRECTION = 2

export function mixRgb(color: RGB, target: 0 | 255, step: number): RGB {
  const amount = Math.max(0, Math.min(1, step / MIX_STEPS))
  return color.map(channel => Math.round(channel + (target - channel) * amount)) as unknown as RGB
}

function rgbToHex([red, green, blue]: RGB): string {
  return `#${[red, green, blue].map(channel => channel.toString(16).padStart(2, "0")).join("").toUpperCase()}`
}

export function generateAAOptions(backgroundHex: string, textHex: string): AAOption[] {
  const background = parseOpaqueHex(backgroundHex)
  const text = parseOpaqueHex(textHex)
  if (!background || !text) return []

  const options: AAOption[] = []
  const seen = new Set<string>()
  const currentRatio = contrastRatio(background, text)
  const currentHex = rgbToHex(text)

  if (meets(currentRatio, AA_NORMAL_TEXT)) {
    options.push({ color: currentHex, ratio: currentRatio, direction: "Current" })
    seen.add(currentHex)
  }

  for (const [target, direction] of [[0, "Toward black"], [255, "Toward white"]] as const) {
    let added = 0
    for (let step = 1; step <= MIX_STEPS && added < OPTIONS_PER_DIRECTION; step += 1) {
      const color = rgbToHex(mixRgb(text, target, step))
      if (seen.has(color)) continue
      const ratio = contrastRatio(background, parseOpaqueHex(color)!)
      if (!meets(ratio, AA_NORMAL_TEXT)) continue
      seen.add(color)
      options.push({ color, ratio, direction })
      added += 1
    }
  }

  return options
}
