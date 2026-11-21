import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Status dot",
  category: "feedback",
  description: "One dot, one word. Live things ping.",
  summary: "An inline status indicator: a small square dot with a label, a pixel-stepped ping when live and a caret blink when busy.",
  keywords: ["status", "indicator", "dot", "badge", "live", "online", "uptime", "health", "presence"],
  since: "0.23.0",
  order: 40,
  usage: `import { StatusDot } from "@/components/wlkr/status-dot"

<StatusDot status="live">Live</StatusDot>
<StatusDot status="busy">Building</StatusDot>
<StatusDot status="warning">Degraded</StatusDot>
<StatusDot status="error" shape="round">Down</StatusDot>

// No visible word: the label is read instead.
<StatusDot status="idle" size="sm" label="Pixels is idle" />

<p>All systems <StatusDot status="live">operational</StatusDot></p>`,
  api: [{
    props: [
      { name: "status", type: `"live" | "busy" | "warning" | "error" | "idle"`, default: `"idle"`, description: "Sets the colour and the default motion. Idle is a hollow outline." },
      { name: "children", type: "React.ReactNode", description: "The visible word beside the dot. Keeps the normal text colour." },
      { name: "label", type: "string", description: "Visually hidden text used when there are no children. Defaults to the status name, e.g. \"Live\"." },
      { name: "pulse", type: "boolean", default: "true for live and busy", description: "Live (and any other status) pings outward; busy blinks like a block caret." },
      { name: "shape", type: `"square" | "round"`, default: `"square"`, description: "Square by default; round for places that expect a dot." },
      { name: "size", type: `"sm" | "md"`, default: `"md"`, description: "Dot of 6px or 8px. It sits centred on the x-height at any font size." },
      { name: "className", type: "string", description: "Merged onto the root span. Native span props pass through." },
    ],
  }],
  notes: [
    "Colour never carries the status alone: there is always a visible word or hidden text for assistive technology.",
    "It is not a live region, so changes are not announced. Wrap it in one (for example role=\"status\") if a change should be heard.",
    "Warning amber reads in both themes and can be set with a --warning custom property.",
    "The motion is pure CSS on opacity and transform. Reduced motion shows a still dot.",
  ],
  related: ["toaster", "pixel-progress"],
}
