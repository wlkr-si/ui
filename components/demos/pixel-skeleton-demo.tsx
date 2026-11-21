"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { PixelSkeleton } from "@/registry/wlkr/pixel-skeleton"

export function PixelSkeletonDemo() {
  const [loaded, setLoaded] = React.useState(false)
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex w-full max-w-[420px] flex-col gap-4 text-sm leading-normal" aria-busy={!loaded}>
        <div className="flex items-center gap-3">
          {loaded ? <span className="size-11 flex-none bg-muted-foreground" aria-hidden="true" /> : <PixelSkeleton variant="circle" width={44} label="Loading project" />}
          <div className="min-w-0 flex-1">
            {loaded ? (
              <>
                <p className="font-medium">Brand Studio</p>
                <p className="text-muted-foreground">Updated 4 minutes ago</p>
              </>
            ) : <PixelSkeleton lines={2} />}
          </div>
        </div>
        {loaded ? <div className="h-[140px] w-full bg-muted" aria-hidden="true" /> : <PixelSkeleton variant="block" height={140} />}
        {loaded
          ? <p>New type scale for the studio site. Headings are tighter, body copy is a step larger, and the grid now holds at every width, from a phone to the studio wall.</p>
          : <PixelSkeleton lines={3} />}
      </div>
      <label className="flex min-h-11 items-center gap-3 text-xs text-muted-foreground"><Switch checked={loaded} onCheckedChange={setLoaded} />Loaded</label>
    </div>
  )
}
