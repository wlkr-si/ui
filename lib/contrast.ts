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
