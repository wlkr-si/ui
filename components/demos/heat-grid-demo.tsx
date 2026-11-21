"use client"

import { HeatGrid } from "@/registry/wlkr/heat-grid"

const END = "2026-11-20"

/** Seeded so server and client draw the same half year. */
function sample() {
  let seed = 20261120
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const end = Date.UTC(2026, 10, 20)
  return Array.from({ length: 186 }, (_, index) => {
    const back = 185 - index
    const date = new Date(end - back * 86400000)
    const weekend = date.getUTCDay() % 6 === 0
    const streak = back % 47 < 5 || (back > 96 && back < 106)
    const off = random() < (weekend ? 0.6 : 0.14)
    const count = off ? 0 : Math.round(random() * (weekend ? 2 : 6) + (streak ? 5 + random() * 9 : 0))
    return { date: date.toISOString().slice(0, 10), count }
  })
}

const DAYS = sample()

export function HeatGridDemo() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <HeatGrid label="wlkr/ui commits" data={DAYS} end={END} unit={["commit", "commits"]} />
    </div>
  )
}
