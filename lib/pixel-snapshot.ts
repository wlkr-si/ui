/** Gallery-only snapshots of the already-rendered pixel frame. */
export function capturePixelSvg(svg: SVGSVGElement) {
  const bounds = svg.getBoundingClientRect()
  const width = Math.round(bounds.width)
  const height = Math.round(bounds.height)
  if (!svg.getAttribute("viewBox") || width < 1 || height < 1) {
    throw new Error("The pixel preview is not ready. Try again.")
  }
  const clone = svg.cloneNode(true) as SVGSVGElement
  const color = getComputedStyle(svg).color
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("width", String(width))
  clone.setAttribute("height", String(height))
  clone.setAttribute("color", color)
  // Resolve inherited theme color before the snapshot leaves this document.
  for (const pixel of clone.querySelectorAll('[fill="currentColor"]')) pixel.setAttribute("fill", color)
  const xml = new XMLSerializer().serializeToString(clone)
  return { blob: new Blob([xml], { type: "image/svg+xml;charset=utf-8" }), width, height }
}

export async function pixelPng(snapshot: ReturnType<typeof capturePixelSvg>) {
  const url = URL.createObjectURL(snapshot.blob)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement("canvas")
    canvas.width = snapshot.width
    canvas.height = snapshot.height
    const context = canvas.getContext("2d")
    if (!context) throw new Error("PNG export is unavailable in this browser. Try SVG.")
    // A fresh canvas is transparent; draw only the captured pixel SVG.
    context.drawImage(image, 0, 0, snapshot.width, snapshot.height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG could not be created. Try SVG.")), "image/png")
    })
  } finally { URL.revokeObjectURL(url) }
}

export function downloadPixelSnapshot(blob: Blob, format: "svg" | "png") {
  downloadPixelFile(blob, `pixel-object.${format}`)
}

export function downloadPixelFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.append(link)
  try { link.click() }
  finally {
    link.remove()
    // Let the browser consume the download before releasing its blob.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
