"use client"

import { IndexRow } from "@/registry/wlkr/index-row"

export function IndexRowDemo() {
  return (
    <div className="w-full">
      <IndexRow number={7} title="Brand Studio" description="Considered tools for a clear identity." href="https://wlkr.si" target="_blank" rel="noreferrer">In progress</IndexRow>
      <IndexRow number={42} title="WeatherGoblin" href="https://wlkr.si" target="_blank" rel="noreferrer">In development</IndexRow>
    </div>
  )
}
