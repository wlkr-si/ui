"use client"

import * as React from "react"
import { ScrollSpy } from "@/registry/wlkr/scroll-spy"

const sections = [
  { id: "spy-demo-overview", label: "Overview", depth: 0 as const, copy: "WLKR.SI is a small studio. Each project starts with one person who owns it and one plain sentence about what it should do." },
  { id: "spy-demo-brief", label: "The brief", depth: 1 as const, copy: "We write the brief together in an afternoon. It names who it is for, what done looks like, and what we will leave out." },
  { id: "spy-demo-build", label: "Build", depth: 0 as const, copy: "Work ships in small pieces, most days. Brand Studio went live a screen at a time, each one usable on the day it landed." },
  { id: "spy-demo-review", label: "Review", depth: 1 as const, copy: "Reviews happen on the real thing, on a phone and a laptop. If a change needs a long explanation, we change the design instead." },
  { id: "spy-demo-care", label: "Care", depth: 0 as const, copy: "After launch we keep watch. WeatherGoblin gets a short note each month with what moved, what broke and what we fixed." },
]

export function ScrollSpyDemo() {
  const box = React.useRef<HTMLDivElement>(null)
  return (
    <div className="grid w-full gap-5 sm:grid-cols-[140px_1fr]">
      <ScrollSpy items={sections} root={box} offset={16} />
      <div ref={box} tabIndex={0} aria-label="How the studio works" className="h-[240px] overflow-y-auto pr-3 outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
        {sections.map(section => (
          <section key={section.id} id={section.id} style={{ margin: 0 }} className="pt-4 pb-6 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring">
            <h3 style={{ margin: 0 }} className="text-sm font-medium tracking-tight">{section.label}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.copy}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
