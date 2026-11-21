"use client"

import { PixelCanvas, pixelsFromRows } from "@/registry/wlkr/pixel-canvas"

const glyph = pixelsFromRows([
  "................",
  "................",
  "................",
  "..##........##..",
  "..##........##..",
  "..##........##..",
  "..##...##...##..",
  "..##...##...##..",
  "..##..####..##..",
  "..##.##..##.##..",
  "..####....####..",
  "..###......###..",
  "..##........##..",
  "................",
  "............++..",
  "............++..",
])

export function PixelCanvasDemo() {
  return <PixelCanvas defaultValue={glyph} aria-label="Pixel art" />
}
