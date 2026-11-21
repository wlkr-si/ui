import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel progress",
  category: "feedback",
  description: "Progress you can count. Cells fill from the left behind a dithered edge, with one green wave at the finish.",
  summary: "An accessible pixel-grid progress bar with a dithered leading edge and an indeterminate state.",
  keywords: ["progress", "bar", "loading", "upload", "dither", "indeterminate", "percent"],
  since: "0.22.0",
  order: 10,
  usage: `import { PixelProgress } from "@/components/wlkr/pixel-progress"

<PixelProgress label="Uploading assets" value={percent} showValue />

// No known length yet? Pass null.
<PixelProgress label="Preparing upload" value={null} />`,
  api: [{
    props: [
      { name: "label", type: "string", description: "Accessible name for the progress bar." },
      { name: "value", type: "number | null", default: "indeterminate", description: "0–100, clamped. null, undefined or a non-finite number means unknown length." },
      { name: "columns", type: "number", default: "48", description: "Grid width in cells, 8–160." },
      { name: "rows", type: "number", default: "4", description: "Grid height in cells, 1–8." },
      { name: "showValue", type: "boolean", default: "false", description: "A fixed-width percentage at the trailing edge." },
      { name: "className", type: "string", description: "Merged onto the root." },
      { name: "...props", type: "React.ComponentProps<\"div\">", description: "Other div props are passed through, except role and the ARIA value attributes." },
    ],
  }],
  notes: [
    "The root is a progressbar whose aria-valuenow and aria-valuetext carry the real target value; the drawing is hidden from assistive technology.",
    "The displayed fill eases toward the value, and the leading four columns dissolve through a 4×4 ordered-dither matrix.",
    "Reaching 100 runs one green wave and leaves the last columns green.",
    "Unknown length shows a travelling dithered packet that pauses off screen.",
    "Reduced motion draws exact values with no easing or wave, and a still checker for unknown length.",
  ],
  related: ["wlkr-loader", "async-action", "dot-matrix"],
}
