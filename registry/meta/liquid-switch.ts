import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Liquid switch",
  category: "inputs",
  description: "On or off, with a little surface tension.",
  summary: "A toggle switch whose thumb stretches, necks and snaps across the track like a drop of liquid.",
  keywords: ["switch", "toggle", "checkbox", "liquid", "goo", "setting", "form"],
  since: "0.23.0",
  order: 50,
  usage: `import { LiquidSwitch } from "@/components/wlkr/liquid-switch"

const [on, setOn] = React.useState(true)

<label className="flex items-center justify-between gap-4">
  Notifications
  <LiquidSwitch checked={on} onCheckedChange={setOn} />
</label>

// Without a visible label, name it. With name, it submits in a form.
<LiquidSwitch label="Weekly digest" name="digest" tone="ink" size="sm" />`,
  api: [{
    props: [
      { name: "checked", type: "boolean", description: "Controlled state. Pair with onCheckedChange." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the new state on every toggle." },
      { name: "defaultChecked", type: "boolean", default: "false", description: "Uncontrolled starting state." },
      { name: "label", type: "string", description: "Accessible name when there is no visible label. Otherwise wrap it in a label or pass aria-labelledby." },
      { name: "tone", type: `"ink" | "brand"`, default: `"brand"`, description: "Colour of the on state." },
      { name: "size", type: `"sm" | "md"`, default: `"md"`, description: "Track of 36×20 or 44×24 pixels." },
      { name: "disabled", type: "boolean", default: "false", description: "Dims the switch and ignores input." },
      { name: "name", type: "string", description: "Renders a hidden checkbox so the state submits with a native form." },
      { name: "value", type: "string", default: `"on"`, description: "Submitted value while on." },
      { name: "className", type: "string", description: "Merged onto the button. Other button props are passed through." },
    ],
  }],
  notes: [
    "It is a button with role switch and aria-checked, so Space and Enter toggle it and screen readers announce the new state.",
    "The hit area is 44px tall and at least 44px wide, larger than the track.",
    "Pressing and holding widens the thumb toward the far side before it goes.",
    "Reduced motion moves the thumb and colour immediately, with no stretch or squish.",
    "The hidden checkbox only renders with name; it is disabled along with the switch, so a disabled switch does not submit.",
  ],
  related: ["liquid-tabs", "pixel-slider"],
}
