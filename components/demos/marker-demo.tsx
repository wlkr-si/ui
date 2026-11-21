"use client"

import { Marker } from "@/registry/wlkr/marker"

export function MarkerDemo() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <p className="w-[min(410px,86%)] text-[22px] leading-[1.45] tracking-[-0.01em]">
        We make <Marker>fewer components</Marker>, and we make them <Marker variant="underline" delay={300}>properly</Marker>.
        No <Marker variant="strike" tone="ink" delay={600}>dashboards full of dials</Marker> — just the parts you would have built yourself,{" "}
        <Marker tone="ink" delay={900}>already finished</Marker>.
      </p>
    </div>
  )
}
