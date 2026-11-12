import test from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { inflateSync } from "node:zlib"

const previews = [
  { html: "out/index.html", path: "/opengraph-image", canonical: "https://ui.wlkr.si/", title: "wlkr/ui" },
  { html: "out/pixels.html", path: "/pixels/opengraph-image", canonical: "https://ui.wlkr.si/pixels", title: "Pixels — wlkr/ui" },
  { html: "out/contrast.html", path: "/contrast/opengraph-image", canonical: "https://ui.wlkr.si/contrast", title: "Contrast — wlkr/ui" },
]
const sha = bytes => createHash("sha256").update(bytes).digest("hex")
function decodePng(bytes) {
  assert.equal(bytes.toString("hex", 0, 8), "89504e470d0a1a0a", "PNG signature")
  let offset = 8, width, height, depth, colorType
  const compressed = []
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset)
    const kind = bytes.toString("ascii", offset + 4, offset + 8)
    const data = bytes.subarray(offset + 8, offset + 8 + length)
    if (kind === "IHDR") {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4); depth = data[8]; colorType = data[9]
      assert.equal(data[12], 0, "non-interlaced image")
    }
    if (kind === "IDAT") compressed.push(data)
    offset += length + 12
    if (kind === "IEND") break
  }
  assert.equal(depth, 8)
  assert.equal(colorType, 6, "RGBA pixels")
  const raw = inflateSync(Buffer.concat(compressed))
  const stride = width * 4
  const pixels = Buffer.alloc(height * stride)
  const paeth = (a, b, c) => {
    const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c)
    return da <= db && da <= dc ? a : db <= dc ? b : c
  }
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    for (let x = 0; x < stride; x++) {
      const value = raw[y * (stride + 1) + 1 + x]
      const left = x >= 4 ? pixels[y * stride + x - 4] : 0
      const above = y ? pixels[(y - 1) * stride + x] : 0
      const upperLeft = y && x >= 4 ? pixels[(y - 1) * stride + x - 4] : 0
      const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? above : filter === 3 ? Math.floor((left + above) / 2) : paeth(left, above, upperLeft)
      pixels[y * stride + x] = (value + predictor) & 255
    }
  }
  return { width, height, pixels }
}
function sample(png, x, y) {
  const offset = (y * png.width + x) * 4
  return [...png.pixels.subarray(offset, offset + 4)]
}

test("static previews are distinct, 1200 by 630 PNG artwork", async () => {
  const digests = new Set()
  for (const preview of previews) {
    const image = decodePng(await readFile(`out${preview.path}`))
    assert.equal(image.width, 1200, preview.path)
    assert.equal(image.height, 630, preview.path)
    assert.deepEqual(sample(image, 2, 2), [51, 242, 130, 255], "brand-green top stripe")
    let artworkPixels = 0
    const colors = new Set()
    for (let offset = 0; offset < image.pixels.length; offset += 4) {
      const key = image.pixels.toString("hex", offset, offset + 4)
      colors.add(key)
      if (image.pixels[offset] !== 1 || image.pixels[offset + 1] !== 1 || image.pixels[offset + 2] !== 1) artworkPixels++
    }
    assert.ok(artworkPixels > 10000, "visible title and sample artwork")
    assert.ok(colors.size > 8, "more than flat colour blocks")
    digests.add(sha(await readFile(`out${preview.path}`)))
  }
  assert.equal(digests.size, 3, "each page has its own preview image")
})

test("each exported page names its canonical URL and matching social image", async () => {
  for (const preview of previews) {
    const html = await readFile(preview.html, "utf8")
    assert.match(html, new RegExp(`<title>${preview.title.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}</title>`))
    assert.ok(html.includes(`<link rel="canonical" href="${preview.canonical.replace(/\/$/, "")}"`), preview.html)
    assert.ok(html.includes(`content="https://ui.wlkr.si${preview.path}`), `${preview.html} Open Graph image`)
    assert.ok(html.includes(`content="https://ui.wlkr.si${preview.path}"`), `${preview.html} Twitter image`)
    assert.match(html, /property="og:image:type" content="image\/png"/)
    assert.match(html, /property="og:image:width" content="1200"/)
    assert.match(html, /property="og:image:height" content="630"/)
    assert.match(html, /name="twitter:card" content="summary_large_image"/)
    const metadata = html.slice(0, html.indexOf("</head>"))
    assert.doesNotMatch(metadata, /ui\.wlkrlabs\.com|WLKR Labs component collection|Interfaces, reduced/)
  }
  const headers = await readFile("out/_headers", "utf8")
  for (const { path } of previews) assert.ok(headers.includes(`${path}\n  Content-Type: image/png`), path)
})
