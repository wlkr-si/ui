import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Hint",
  category: "feedback",
  description: "A small ink label for a control. It wipes open in pixel steps.",
  summary: "A tooltip that shows a solid mono label beside its trigger on hover or keyboard focus, with a stepped clip reveal and viewport flipping.",
  keywords: ["tooltip", "hint", "hover", "label", "popover", "shortcut", "describedby"],
  since: "0.24.0",
  usage: `import { Hint } from "@/components/wlkr/hint"

<Hint label="Save" shortcut="⌘S">
  <button type="button" aria-label="Save">S</button>
</Hint>

<Hint label="Next page" side="right" delay={500}>
  <button type="button">→</button>
</Hint>`,
  api: [{
    props: [
      { name: "children", type: "React.ReactElement", description: "One trigger element. It receives aria-describedby pointing at the hint." },
      { name: "label", type: "React.ReactNode", description: "The hint text." },
      { name: "side", type: `"top" | "bottom" | "left" | "right"`, default: `"top"`, description: "Preferred side. Flips to the opposite side when it would leave the viewport." },
      { name: "delay", type: "number", default: "300", description: "Milliseconds before opening on hover or pointer focus. Keyboard focus opens at once." },
      { name: "shortcut", type: "string", description: "Key combination shown after the label in a dimmer tone." },
      { name: "open", type: "boolean", description: "Controlled open state. Leave unset to let hover and focus drive it." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when hover, focus or Escape would open or close it." },
      { name: "disabled", type: "boolean", default: "false", description: "Never shows the hint." },
    ],
  }],
  notes: [
    "Keyboard focus shows the hint straight away and Escape hides it.",
    "The hint stays open while the pointer moves onto it, so it can be read and selected.",
    "The label has role=\"tooltip\" and is linked to the trigger with aria-describedby, so screen readers read it as a description, not a name.",
    "Reduced motion drops the stepped wipe and shows the hint at once.",
    "Touch does not open it; give icon-only controls an aria-label as well.",
  ],
  related: ["shortcut", "toaster", "status-dot"],
}
