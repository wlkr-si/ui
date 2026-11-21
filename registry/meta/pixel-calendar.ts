import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel calendar",
  category: "inputs",
  description: "One month on a square grid. Pick a day, it turns to ink.",
  summary: "A single-month date picker on a borderless seven-column grid with a solid selected block, a green pixel for today and full ARIA grid keyboard support.",
  keywords: ["calendar", "date picker", "date", "month", "grid", "schedule", "day"],
  since: "0.24.0",
  usage: `import { PixelCalendar } from "@/components/wlkr/pixel-calendar"

<PixelCalendar defaultValue={new Date(2026, 10, 20)} onValueChange={date => console.log(date)} />

// Controlled, Sunday first, limited range.
const [date, setDate] = React.useState<Date | null>(null)
<PixelCalendar
  value={date}
  onValueChange={setDate}
  weekStartsOn={0}
  locale="en-US"
  min={new Date(2026, 10, 1)}
  max={new Date(2026, 11, 31)}
/>`,
  api: [{
    props: [
      { name: "value", type: "Date | null", description: "The selected day when controlled." },
      { name: "defaultValue", type: "Date | null", default: "null", description: "The selected day when uncontrolled." },
      { name: "onValueChange", type: "(value: Date | null) => void", description: "Called when a day is chosen." },
      { name: "month", type: "Date", description: "Any date in the month to show, when controlled." },
      { name: "defaultMonth", type: "Date", default: "defaultValue's month", description: "The first month shown when uncontrolled." },
      { name: "onMonthChange", type: "(month: Date) => void", description: "Called with the first of the month whenever the shown month changes." },
      { name: "min", type: "Date", description: "Earliest selectable day. Earlier days are struck through and skipped." },
      { name: "max", type: "Date", description: "Latest selectable day." },
      { name: "weekStartsOn", type: "0 | 1", default: "1", description: "0 starts weeks on Sunday, 1 on Monday." },
      { name: "locale", type: "string", default: `"en-GB"`, description: "Locale for the month title, weekday initials and day labels." },
      { name: "today", type: "Date", description: "Which day carries the green pixel. Without it, today is read on the client after mount." },
      { name: "className", type: "string", description: "Merged onto the root div. Native div props pass through." },
    ],
  }],
  notes: [
    "It follows the ARIA grid pattern with one tab stop: arrows move by day and week, Home and End jump to the week's edges, PageUp and PageDown change month (with Shift, year), Enter or Space selects.",
    "Dates are compared by year, month and day only, so time zones and daylight saving shifts never move the selection.",
    "Today is never read during server render, so there is no hydration mismatch; pass today to pin it.",
    "The only motion is a stepped colour change on hover and selection, removed under reduced motion.",
  ],
  related: ["pixel-slider", "liquid-switch", "countdown"],
}
