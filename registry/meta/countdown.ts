import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Countdown",
  category: "data",
  description: "Time left, on wheels. It rolls once a second and never drifts.",
  summary: "A countdown to a target time with days, hours, minutes and seconds on rolling digit wheels, a hydration-safe placeholder and one shared wall-clock ticker.",
  keywords: ["countdown", "timer", "launch", "deadline", "clock", "time", "remaining", "wheel", "odometer"],
  since: "0.23.0",
  order: 30,
  usage: `import { Countdown } from "@/components/wlkr/countdown"

<Countdown to="2027-01-01T00:00:00Z" className="text-5xl font-semibold" />

// No days: hours absorb them and can pass 23.
<Countdown
  to={launch}
  units={["hours", "minutes", "seconds"]}
  completed={<span>Launched.</span>}
  onComplete={() => setLive(true)}
/>`,
  api: [{
    props: [
      { name: "to", type: "Date | number | string", description: "Target time. Numbers are epoch milliseconds; strings are anything Date.parse accepts. Invalid input shows dashes." },
      { name: "units", type: `("days" | "hours" | "minutes" | "seconds")[]`, default: "all four", description: "Units to show, always in largest-first order. The largest shown unit absorbs overflow." },
      { name: "labels", type: "Partial<Record<unit, string>>", default: `"Days", "Hours", "Minutes", "Seconds"`, description: "Text under each unit. Custom labels are also used in the spoken summary." },
      { name: "onComplete", type: "() => void", description: "Called once per target when the time reaches zero, including a target already in the past." },
      { name: "completed", type: "React.ReactNode", description: "Shown in place of the wheels once finished. Without it the zeros stay." },
      { name: "separator", type: "boolean", default: "true", description: "A quiet colon of two small squares between units." },
      { name: "aria-label", type: "string", default: `"Time remaining"`, description: "Accessible name of the timer." },
      { name: "className", type: "string", description: "Merged onto the root. Digits inherit font size, weight, tracking and colour from it." },
    ],
  }],
  notes: [
    "The server cannot know the time, so the first render shows en dashes in the same cells; real numbers arrive after mount.",
    "All countdowns on a page share one ticker aligned to the wall-clock second. It stops when none are mounted or the tab is hidden, and jumps straight to the right time when the tab returns.",
    "The root is a timer with an accessible name. Wheels are hidden from assistive tech; a hidden summary at minute resolution, without seconds, is read instead and is never announced on its own.",
    "The largest unit keeps the widest width it has needed for the current target, so the row never shifts while counting down.",
    "With reduced motion the digits switch without rolling.",
  ],
  related: ["rolling-number", "ticker"],
}
