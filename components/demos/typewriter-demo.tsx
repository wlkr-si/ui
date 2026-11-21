"use client"

import { Typewriter } from "@/registry/wlkr/typewriter"

export function TypewriterDemo() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <p className="m-0 max-w-full text-[34px] font-semibold leading-[1.1] tracking-[-0.045em]">
        Interfaces for <Typewriter phrases={["dashboards.", "docs.", "launch pages.", "small studios."]} />
      </p>
      <p className="m-0 font-mono text-sm">
        <span className="text-muted-foreground">$ </span>
        <Typewriter caret="line" smart={false} typeSpeed={70} hold={1400} phrases={["pnpm dev", "pnpm build", "pnpm run deploy"]} />
      </p>
    </div>
  )
}
