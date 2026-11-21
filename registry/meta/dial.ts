import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Dial",
  category: "inputs",
  description: "A knob of square ticks. Turn it, drag it, or step it with the keys.",
  summary: "A rotary knob input drawn in SVG with a ring of ticks, a green current tick and a mono readout, driven by pointer drag and the keyboard.",
  keywords: ["dial", "knob", "rotary", "slider", "range", "gain", "audio", "input"],
  since: "0.24.0",
  usage: `import { Dial } from "@/components/wlkr/dial"

<Dial label="Gain" defaultValue={64} />

<Dial
  label="Pan"
  min={-50}
  max={50}
  defaultValue={0}
  format={n => (n === 0 ? "C" : n < 0 ? \`L\${-n}\` : \`R\${n}\`)}
/>

// Controlled
const [value, setValue] = useState(20)
<Dial label="Mix" value={value} onValueChange={setValue} step={5} size={96} />`,
  api: [{
    props: [
      { name: "value", type: "number", description: "Controlled value." },
      { name: "defaultValue", type: "number", default: "min", description: "Starting value when uncontrolled." },
      { name: "onValueChange", type: "(value: number) => void", description: "Called with each new snapped value." },
      { name: "min", type: "number", default: "0", description: "Lowest value." },
      { name: "max", type: "number", default: "100", description: "Highest value." },
      { name: "step", type: "number", default: "1", description: "Values snap to this step. Shift and Page keys move ten steps." },
      { name: "size", type: "number", default: "120", description: "Width and height of the knob in pixels." },
      { name: "label", type: "string", description: "Visible label under the knob and its accessible name." },
      { name: "format", type: "(n: number) => string", description: "Formats the centre readout and the value read to assistive technology." },
      { name: "disabled", type: "boolean", default: "false", description: "Dims the knob and ignores input." },
      { name: "className", type: "string", description: "Merged onto the root. Native div props pass through." },
    ],
  }],
  notes: [
    "It is a role=\"slider\": arrow keys step, Shift+arrow and PageUp/PageDown move ten steps, Home and End jump to the ends.",
    "Drag up and down near the centre, or around the ring near the edge; the pointer is captured so the drag keeps going outside the knob.",
    "The 32 ticks cover a 270 degree sweep, so with wide ranges one tick stands for several values; the readout is always exact.",
    "Tick colour changes in a stepped transition that reduced motion turns off.",
    "Give it a label or an aria-label so the slider has a name.",
  ],
  related: ["pixel-slider", "pixel-progress", "rolling-number"],
}
