"use client"

import Image from "next/image"
import { Compare } from "@/registry/wlkr/compare"

const W = 960, H = 600, COLUMNS = 32, ROWS = 20
const SPHERE = { x: 480, y: 300, r: 210 }
const LIGHT = { x: SPHERE.x - 0.35 * SPHERE.r, y: SPHERE.y - 0.4 * SPHERE.r, r: 1.35 * SPHERE.r }
const HALO = 1.6 * SPHERE.r
const INK: RGB = [1, 1, 1]
const GREEN: RGB = [51, 242, 130]
const BODY: [number, RGB][] = [[0, [236, 238, 236]], [0.22, [124, 128, 128]], [0.55, [34, 36, 37]], [1, [5, 5, 5]]]
const RIM: [number, number][] = [[0.78, 0], [0.92, 0.35], [1, 0.95]]

type RGB = [number, number, number]

const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * t) as RGB
const ramp = <T,>(stops: [number, T][], t: number, lerp: (a: T, b: T, k: number) => T) => {
  if (t <= stops[0][0]) return stops[0][1]
  for (let i = 1; i < stops.length; i++) {
    const [end, value] = stops[i], [start, previous] = stops[i - 1]
    if (t <= end) return lerp(previous, value, (t - start) / (end - start))
  }
  return stops[stops.length - 1][1]
}

/** The light at one point, by the same stops the smooth picture's gradients use. */
function shade(x: number, y: number): RGB {
  const fromCentre = Math.hypot(x - SPHERE.x, y - SPHERE.y)
  if (fromCentre > SPHERE.r) return mix(INK, GREEN, 0.2 * Math.max(0, 1 - (fromCentre - SPHERE.r) / (HALO - SPHERE.r)))
  const t = Math.min(1, Math.hypot(x - LIGHT.x, y - LIGHT.y) / LIGHT.r)
  return mix(ramp(BODY, t, mix), GREEN, ramp(RIM, t, (a, b, k) => a + (b - a) * k))
}

const hex = (color: RGB) => "#" + color.map(channel => Math.round(channel).toString(16).padStart(2, "0")).join("")
const stop = (offset: number, color: string, opacity = 1) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`
const radial = (id: string, x: number, y: number, r: number, stops: string) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${x}" cy="${y}" r="${r}">${stops}</radialGradient>`

const smooth = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${
  radial("halo", SPHERE.x, SPHERE.y, HALO, stop(SPHERE.r / HALO, hex(GREEN), 0.2) + stop(1, hex(GREEN), 0))
}${radial("body", LIGHT.x, LIGHT.y, LIGHT.r, BODY.map(([offset, color]) => stop(offset, hex(color))).join(""))
}${radial("rim", LIGHT.x, LIGHT.y, LIGHT.r, RIM.map(([offset, opacity]) => stop(offset, hex(GREEN), opacity)).join(""))
}</defs><rect width="${W}" height="${H}" fill="${hex(INK)}"/><rect width="${W}" height="${H}" fill="url(#halo)"/><circle cx="${SPHERE.x}" cy="${SPHERE.y}" r="${SPHERE.r}" fill="url(#body)"/><circle cx="${SPHERE.x}" cy="${SPHERE.y}" r="${SPHERE.r}" fill="url(#rim)"/></svg>`

const cell = W / COLUMNS
const blocks = Array.from({ length: COLUMNS * ROWS }, (_, index) => {
  const column = index % COLUMNS, row = Math.floor(index / COLUMNS)
  return `<rect x="${column * cell}" y="${row * cell}" width="${cell}" height="${cell}" fill="${hex(shade((column + 0.5) * cell, (row + 0.5) * cell))}"/>`
}).join("")
const pixels = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${blocks}</svg>`

const picture = `data:image/svg+xml,${encodeURIComponent(smooth)}`
const pixelated = `data:image/svg+xml,${encodeURIComponent(pixels)}`

export function CompareDemo() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <Compare
        className="w-full"
        aspectRatio={16 / 10}
        beforeLabel="Pixels"
        afterLabel="Picture"
        before={<Image src={pixelated} alt="The sphere drawn as 32 by 20 pixels" width={W} height={H} />}
        after={<Image src={picture} alt="A dark sphere on a black field with a green rim light" width={W} height={H} />}
      />
    </div>
  )
}
