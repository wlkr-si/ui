import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Pixel checkbox",
  category: "inputs",
  description: "A checkbox that fills in pixel by pixel. It empties the same way, backwards.",
  summary: "A native checkbox whose square box fills with a 4x4 grid of pixels in ordered-dither order, with an indeterminate middle row.",
  keywords: ["checkbox", "check", "toggle", "indeterminate", "select all", "form", "pixel", "dither"],
  since: "0.24.0",
  usage: `import { PixelCheckbox } from "@/components/wlkr/pixel-checkbox"

<PixelCheckbox defaultChecked>Remember me</PixelCheckbox>

const [checked, setChecked] = useState(false)
<PixelCheckbox checked={checked} onCheckedChange={setChecked}>Email updates</PixelCheckbox>

// A parent over some checked children.
<PixelCheckbox checked={all} indeterminate={some && !all} onCheckedChange={toggleAll}>
  Select all
</PixelCheckbox>`,
  api: [{
    props: [
      { name: "checked", type: "boolean", description: "Controlled checked state. Pair with onCheckedChange." },
      { name: "defaultChecked", type: "boolean", default: "false", description: "Starting state when uncontrolled." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the new state on every toggle." },
      { name: "indeterminate", type: "boolean", default: "false", description: "Shows a single middle row of pixels and is announced as mixed." },
      { name: "disabled", type: "boolean", default: "false", description: "Dims the control and blocks input." },
      { name: "children", type: "React.ReactNode", description: "The visible label. Clicking it toggles the box." },
      { name: "className", type: "string", description: "Merged onto the label wrapper. Other input props (name, value, required) go to the native input." },
    ],
  }],
  notes: [
    "It is a real input type=\"checkbox\", so Tab focuses it, Space toggles it and it submits with forms.",
    "Indeterminate is set on the native input, so screen readers hear \"mixed\". Clicking it fires onCheckedChange; the parent decides the next state.",
    "Pixels light in a 4x4 Bayer order over about a quarter second and clear in reverse, using stepped timing.",
    "Reduced motion fills and clears the box at once.",
  ],
  related: ["liquid-switch", "pixel-slider", "hold-action"],
}
