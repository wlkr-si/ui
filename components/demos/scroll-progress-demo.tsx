"use client"

import * as React from "react"
import { ScrollProgress } from "@/registry/wlkr/scroll-progress"

const paragraphs = [
  "We would rather ship twelve components we trust than a hundred we have to apologise for.",
  "Every piece in wlkr/ui starts as something a real project needed: a button for Brand Studio, a counter for WeatherGoblin, a reading view for PatriBible.",
  "If it only solved one screen, it stays in that project. If it solved three, it earns a place here.",
  "Fewer parts means each one gets the time it deserves. The keyboard path, the reduced-motion path and the dark theme are not extras; they are the work.",
  "It also means fewer decisions for whoever picks them up. One progress bar, one way to paginate, one way to say something is loading.",
  "When a component grows a second personality, we split it or cut it. Options are cheap to add and expensive to keep.",
  "That is the whole idea. Small, careful, and still here next year.",
]

export function ScrollProgressDemo() {
  const article = React.useRef<HTMLDivElement>(null)
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <ScrollProgress position="inline" target={article} rows={2} label="Sample article progress" />
      <div
        ref={article}
        role="region"
        tabIndex={0}
        aria-label="Sample article"
        className="h-[220px] w-full overflow-y-auto pr-3 text-sm leading-6 outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
      >
        {paragraphs.map(text => <p key={text} className="mb-4 last:mb-0">{text}</p>)}
      </div>
    </div>
  )
}
