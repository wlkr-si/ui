/** Flat transparent bitmap SVG. Browser-only; no projected preview or Node dependency. */
export function flatPixelSvg(mask: readonly string[], ink: string): string {
  if (!Array.isArray(mask) || ![8, 16, 32].includes(mask.length) || Array.from(mask).some(row => typeof row !== "string" || row.length !== mask.length || !/^[.#]+$/.test(row))) throw new Error("Use an 8×8, 16×16 or 32×32 dot/hash mask.")
  if (typeof ink !== "string" || ink.length !== 7 || !/^#[0-9a-f]{6}$/i.test(ink)) throw new Error("Use an opaque six-digit ink colour.")
  const size = mask.length
  const cells = mask.flatMap((row, y) => [...row].flatMap((cell, x) => cell === "#" ? ['<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'] : []))
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" width="' + size * 16 + '" height="' + size * 16 + '" shape-rendering="crispEdges" fill="' + ink.toLowerCase() + '"><title>Pixel mask</title>' + cells.join("") + '</svg>'
}

/** Resolve this frame's computed foreground through a fresh, local, sRGB canvas. */
export function renderedPixelInk(svg: SVGSVGElement): string {
  const color = getComputedStyle(svg).color
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) throw new Error("Flat SVG colour is unavailable. Try an explicit ink colour.")
  // Two sentinels distinguish unsupported CSS colours from a valid black or white.
  context.fillStyle = "#000000"
  context.fillStyle = color
  const normalized = context.fillStyle
  context.fillStyle = "#ffffff"
  context.fillStyle = color
  if (context.fillStyle !== normalized) throw new Error("Flat SVG colour could not be resolved. Try an explicit ink colour.")
  context.fillRect(0, 0, 1, 1)
  const rgba = context.getImageData(0, 0, 1, 1).data
  if (rgba[3] !== 255) throw new Error("Flat SVG needs an opaque foreground. Try an explicit ink colour.")
  return "#" + Array.from(rgba.subarray(0, 3), byte => byte.toString(16).padStart(2, "0")).join("")
}
