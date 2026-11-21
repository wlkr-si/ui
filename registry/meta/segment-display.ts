import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Segment display",
  category: "text",
  description: "Seven square segments per glyph. The unlit ones stay faintly there.",
  summary: "A seven-segment SVG readout for numbers, a few letters and a live clock, with ghost segments and a stepped colon blink.",
  keywords: ["seven segment", "lcd", "readout", "digits", "clock", "counter", "display"],
  since: "0.24.0",
  usage: `import { SegmentDisplay, SegmentClock } from "@/components/wlkr/segment-display"

<SegmentDisplay value={-12.5} tone="brand" />
<SegmentDisplay value="Err" height={32} />
<SegmentDisplay value={42} pad={4} ghost={false} label="42 users online" />

<SegmentClock />
<SegmentClock seconds={false} hour12 height={64} />`,
  api: [
    {
      title: "SegmentDisplay",
      props: [
        { name: "value", type: "string | number", description: "What to show. Digits, minus, space, A b C d E F H L P U o r n, \":\" and \".\". Anything else is blank." },
        { name: "height", type: "number", default: "48", description: "Glyph height in px. Width follows the number of glyphs." },
        { name: "tone", type: `"ink" | "brand"`, default: `"ink"`, description: "Lit segments in the text colour or WLKR green." },
        { name: "ghost", type: "boolean", default: "true", description: "Keeps unlit segments faintly visible." },
        { name: "pad", type: "number", description: "Left-pads with blank glyphs to this many characters, so the width holds still." },
        { name: "label", type: "string", description: "Accessible name. Defaults to the value as text." },
        { name: "blink", type: "boolean", default: "false", description: "Blinks \":\" cells once a second in steps." },
        { name: "className", type: "string", description: "Merged onto the svg. Native svg props pass through." },
      ],
    },
    {
      title: "SegmentClock",
      props: [
        { name: "seconds", type: "boolean", default: "true", description: "Shows HH:MM:SS, or HH:MM when false." },
        { name: "hour12", type: "boolean", default: "false", description: "Twelve-hour time without a leading zero." },
        { name: "height, tone, ghost, label", type: "—", description: "As on SegmentDisplay." },
      ],
    },
  ],
  notes: [
    "The row is one image with an aria-label, so screen readers hear the value, not the segments.",
    "Reduced motion removes the segment fade and stops the colon blinking.",
    "The clock renders dashes on the server and fills in after hydration, so markup never mismatches.",
    "Seven segments cannot draw every letter; unsupported characters render as a blank glyph.",
  ],
  related: ["dot-matrix", "rolling-number", "countdown"],
}
