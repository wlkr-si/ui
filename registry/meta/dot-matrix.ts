import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Dot matrix",
  category: "data",
  description: "A platform board for short messages. A 5×7 font, one column at a time.",
  summary: "A dot-matrix display with a built-in 5×7 font and stepped scrolling for long messages.",
  keywords: ["led", "display", "board", "marquee", "scroll", "text", "bitmap", "font", "sign"],
  since: "0.22.0",
  order: 20,
  usage: `import { DotMatrix } from "@/components/wlkr/dot-matrix"

<DotMatrix text="NEXT: BRAND STUDIO 14:32  ·  ON TIME" columns={64} />

// Dots take the surrounding text colour.
<span style={{ color: "var(--success)" }}>
  <DotMatrix text="OK 200" shape="round" dotSize={5} />
</span>`,
  api: [{
    props: [
      { name: "text", type: "string", description: "The message. Uppercased and capped at 240 characters." },
      { name: "columns", type: "number", default: "width of the text", description: "Visible dot columns, 5–240." },
      { name: "dotSize", type: "number", default: "4", description: "Dot size in pixels at full scale, 1–24." },
      { name: "gap", type: "number", default: "2", description: "Space between dots in pixels, 0–24." },
      { name: "shape", type: `"square" | "round"`, default: `"square"`, description: "The dot shape." },
      { name: "scroll", type: `boolean | "auto"`, default: `"auto"`, description: "Auto scrolls only when the text is wider than columns. True always scrolls; false never does." },
      { name: "speed", type: "number", default: "14", description: "Columns per second, 1–60." },
      { name: "label", type: "string", default: "text", description: "Accessible name." },
      { name: "className", type: "string", description: "Merged onto the root." },
      { name: "...props", type: "React.ComponentProps<\"div\">", description: "Other div props are passed through." },
    ],
  }],
  notes: [
    "The built-in font covers A–Z, 0–9, space and . , : ; ! ? - + / ' \" % & ( ) # @ = * < > _ ·. Zero is slashed, and unknown characters show as a small hollow box.",
    "Lit dots take the surrounding text colour.",
    "The board starts with the message in place, moves one whole column at a time, and pauses off screen and in hidden tabs.",
    "It scales down to fit narrow containers.",
    "Reduced motion shows the start of the text, still. Screen readers get the text once, as an image label.",
  ],
  related: ["ticker", "rolling-number", "pixel-progress"],
}
