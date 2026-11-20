"use client"

import { DotMatrix } from "@/registry/wlkr/dot-matrix"

export function DotMatrixDemo() {
  return (
    <div className="flex w-full flex-col items-start gap-8">
      <DotMatrix text="WLKR.SI  ·  NEXT: BRAND STUDIO 14:32  ·  WEATHERGOBLIN 14:40  ·  ON TIME" columns={64} dotSize={4} gap={2} />
      <div style={{ color: "var(--success)" }}>
        <DotMatrix text="OK 200" shape="round" dotSize={5} gap={2} />
      </div>
    </div>
  )
}
