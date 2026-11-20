"use client"

import { DotField } from "@/registry/wlkr/dot-field"

export function DotFieldDemo() {
  return <div className="flex w-full flex-col items-start gap-5">
    <DotField className="h-[260px] w-full">
      <div className="flex h-full items-center justify-center px-6">
        <p className="m-0 text-center text-[34px] font-[640] leading-none tracking-[-0.05em] text-foreground sm:text-[44px]">Move through it.</p>
      </div>
    </DotField>
  </div>
}
