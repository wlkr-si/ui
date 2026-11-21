"use client"

import { PixelSpinner } from "@/registry/wlkr/pixel-spinner"

const variants = ["orbit", "snake", "scan", "dither", "pulse", "bar"] as const

export function PixelSpinnerDemo() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <ul className="flex flex-wrap justify-center gap-x-8 gap-y-6">
        {variants.map(variant => (
          <li key={variant} className="flex flex-col items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center">
              <PixelSpinner variant={variant} size="28px" accent label={`Loading, ${variant}`} />
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">{variant}</span>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-2 font-mono text-sm">
        <PixelSpinner variant="orbit" accent label="Syncing" />
        Syncing
      </p>
    </div>
  )
}
