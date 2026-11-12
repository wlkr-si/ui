"use client"

import * as React from "react"
import Link from "next/link"
import { WlkrLoader } from "@/registry/wlkr/wlkr-loader"

/** The Open Lens mark, crisp at rest, with the quick liquid hover bounce used on wlkr.si. */
export function HeaderIdentity() {
  const [playing, setPlaying] = React.useState(false)
  const play = () => { if (matchMedia("(hover: hover) and (pointer: fine)").matches) setPlaying(true) }
  return <Link href="/" className="identity" aria-label="wlkr/ui home" prefetch={false} onPointerEnter={play}>
    <span className="brand-mark"><WlkrLoader size={40} duration={350} cutThrough loop={false} bounce frame={playing ? undefined : 0} onCycleComplete={() => setPlaying(false)} decorative /></span>
    <span>wlkr<span className="text-muted-foreground">/</span>ui</span>
  </Link>
}
