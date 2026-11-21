import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Scrub input",
  category: "inputs",
  description: "A number you can grab. Drag the label, type, or use the arrow keys.",
  summary: "A numeric text field whose label scrubs the value by dragging, with a tick ruler that glides with the number.",
  keywords: ["number", "input", "scrub", "drag", "slider", "spinbutton", "ruler", "design tool", "numeric"],
  since: "0.23.0",
  order: 20,
  usage: `import { ScrubInput } from "@/components/wlkr/scrub-input"

const [width, setWidth] = useState(72)

<ScrubInput label="Width" unit="px" min={0} max={400} value={width} onValueChange={setWidth} />

// Uncontrolled, with a finer step.
<ScrubInput label="Line height" defaultValue={1.4} step={0.05} min={1} max={2} />`,
  api: [{
    props: [
      { name: "label", type: "string", description: "Visible label and the drag handle. Also names the field." },
      { name: "value", type: "number", description: "Controlled value." },
      { name: "defaultValue", type: "number", default: "0", description: "Starting value when uncontrolled." },
      { name: "onValueChange", type: "(value: number) => void", description: "Called with each committed value, rounded to the precision." },
      { name: "min", type: "number", description: "Lower bound. Enables Home." },
      { name: "max", type: "number", description: "Upper bound. Enables End." },
      { name: "step", type: "number", default: "1", description: "Change per arrow press or per drag interval." },
      { name: "precision", type: "number", default: "decimals in step", description: "Decimals shown and kept, 0–6." },
      { name: "unit", type: "string", description: "Suffix such as \"px\" or \"%\". Shown after the number, not editable." },
      { name: "sensitivity", type: "number", default: "6", description: "Pixels of drag per step, 1–40." },
      { name: "disabled", type: "boolean", default: "false", description: "Turns off typing, keys and dragging." },
      { name: "className", type: "string", description: "Merged onto the root." },
    ],
  }],
  notes: [
    "Drag the label sideways to change the value; a drag starts after 3px, so a plain click just focuses and selects the number. Vertical touch drags still scroll the page.",
    "Arrow Up and Down move one step, Page Up and Down ten, and Home and End jump to min and max when set. Shift multiplies by ten and Alt divides by ten, never finer than the shown precision.",
    "Typing edits a draft. Enter or leaving the field commits it, clamped and rounded; Escape or invalid text brings back the last value.",
    "The input is a real text field with the spinbutton role, so screen readers hear the value with its unit.",
    "Values are kept as whole multiples of the precision, so steps like 0.1 never drift.",
    "Under reduced motion the ruler jumps to its new position instead of gliding.",
  ],
  related: ["code-input", "rolling-number"],
}
