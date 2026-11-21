"use client"

import { PixelTrail } from "@/registry/wlkr/pixel-trail"

export function PixelTrailDemo() {
  return <div className="flex w-full flex-col items-start gap-5">
    <PixelTrail className="h-[280px] w-full">
      <div className="flex h-full items-center justify-center px-6">
        <p className="m-0 text-center text-[34px] font-[640] leading-none tracking-[-0.05em] text-foreground [paint-order:stroke_fill] [-webkit-text-stroke:8px_var(--control-surface)] sm:text-[44px]">Draw something.</p>
      </div>
    </PixelTrail>
  </div>
}
