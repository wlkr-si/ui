import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Ticker",
  category: "text",
  description: "A line that keeps moving. Constant speed, a soft stop on hover, and a drag when you want a closer look.",
  summary: "A constant-speed marquee that eases to a stop on hover and focus, drags with momentum, and steps out at the edges.",
  keywords: ["marquee", "scroll", "loop", "logos", "status", "strip", "drag", "carousel"],
  since: "0.22.0",
  order: 60,
  usage: `import { Ticker } from "@/components/wlkr/ticker"

<Ticker label="Studio status" speed={40}>
  <span>Brand Studio — shipped</span>
  <a href="/work/weathergoblin">WeatherGoblin — in development</a>
  <span>PatriBible — reading plan live</span>
</Ticker>`,
  api: [{
    props: [
      { name: "children", type: "React.ReactNode", description: "The items, laid out in one row. They are repeated to fill the loop, so avoid ids inside." },
      { name: "speed", type: "number", default: "40", description: "Pixels per second, 5–400, whatever the content width." },
      { name: "direction", type: `"left" | "right"`, default: `"left"`, description: "Which way the row travels." },
      { name: "gap", type: "number", default: "40", description: "Pixels between items and between repeats, 0–200." },
      { name: "pauseOnHover", type: "boolean", default: "true", description: "Eases to a stop under a mouse or pen." },
      { name: "draggable", type: "boolean", default: "true", description: "Grab the row and fling it with momentum." },
      { name: "fade", type: "boolean", default: "true", description: "Dissolves both edges in stepped bands." },
      { name: "label", type: "string", description: "Accessible name; when given, the root is a labelled group." },
      { name: "className", type: "string", description: "Merged onto the root." },
      { name: "...props", type: "React.ComponentProps<\"div\">", description: "Other div props are passed through, except role." },
    ],
  }],
  notes: [
    "Repeats are aria-hidden and inert, so assistive technology and Tab meet each item once.",
    "Keyboard focus stops the row and brings the focused item fully into view.",
    "A drag starts after 6 px of mostly horizontal movement and suppresses the click that follows; vertical gestures still scroll the page.",
    "The loop stops off screen and in hidden tabs.",
    "Reduced motion turns it into a plain, horizontally scrollable row with no repeats.",
  ],
  related: ["dot-matrix", "decode-text"],
}
