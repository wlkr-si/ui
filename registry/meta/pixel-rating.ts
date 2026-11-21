import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel rating",
  category: "inputs",
  description: "Blocks, not stars. Click to rate, click again to clear.",
  summary: "A rating input made of square blocks: hover previews, click sets, and filled blocks pop in with a stepped stagger, the newest in WLKR green.",
  keywords: ["rating", "stars", "score", "review", "radiogroup", "feedback", "blocks"],
  since: "0.24.0",
  usage: `import { PixelRating } from "@/components/wlkr/pixel-rating"

const [value, setValue] = React.useState(3)

<PixelRating value={value} onValueChange={setValue} aria-label="Rating" />

// Uncontrolled
<PixelRating defaultValue={4} aria-label="Rate this build" />

// Display only
<PixelRating value={7} max={10} readOnly size="sm" aria-label="Rated 7 of 10" />`,
  api: [{
    props: [
      { name: "value", type: "number", description: "Controlled value from 0 (none) to max." },
      { name: "defaultValue", type: "number", default: "0", description: "Starting value when uncontrolled." },
      { name: "onValueChange", type: "(value: number) => void", description: "Called with the new value. Clearing passes 0." },
      { name: "max", type: "number", default: "5", description: "Number of blocks." },
      { name: "readOnly", type: "boolean", default: "false", description: "Shows the value and stays focusable, but cannot be changed." },
      { name: "disabled", type: "boolean", default: "false", description: "Dims the control and removes it from the tab order." },
      { name: "size", type: `"sm" | "md" | "lg"`, default: `"md"`, description: "Blocks of 12px, 16px or 22px." },
      { name: "aria-label", type: "string", description: "Names the group for assistive technology. Each block reads as \"3 of 5\"." },
      { name: "className", type: "string", description: "Merged onto the root. Native div props pass through." },
    ],
  }],
  notes: [
    "It is a radiogroup with one tab stop. Arrow keys move the value, Home and End jump to the ends, number keys set it directly, and 0, Backspace or Delete clear it.",
    "Space or Enter on the current block clears it, the same as clicking it.",
    "Hover preview uses a dithered fill and only responds to a mouse, so touch taps set the value straight away.",
    "Reduced motion drops the pop-in; blocks fill instantly.",
    "Wraps onto more rows when there is not enough width, so large max values stay inside 320px.",
  ],
  related: ["pixel-slider", "pixel-progress", "liquid-switch"],
}
