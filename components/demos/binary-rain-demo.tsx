"use client"

import { BinaryRain } from "@/registry/wlkr/binary-rain"

export function BinaryRainDemo() {
  return (
    <div className="w-full">
      <BinaryRain className="h-[260px] w-full" seed={7}>
        <div className="flex h-full items-center justify-center">
          <span className="bg-background px-4 py-2 font-mono text-sm tracking-widest">01 WLKR</span>
        </div>
      </BinaryRain>
    </div>
  )
}
