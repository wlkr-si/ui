import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Icon button",
  category: "basics",
  order: 2,
  description: "A round icon-only control for media players and toolbars.",
  summary: "A round icon-only button with glass, plain and outline variants, four sizes that match Button and a brand-coloured toggle state.",
  keywords: ["icon", "button", "glass", "round", "pressed", "toolbar", "media"],
  since: "0.25.0",
  usage: `import { Play } from "lucide-react"
import { IconButton } from "@/components/wlkr/icon-button"

<IconButton aria-label="Play"><Play aria-hidden="true" /></IconButton>`,
  examples: [
    { id: "glass", title: "Glass", description: "Use the translucent glass variant over photos or video where the backdrop should show through." },
    { id: "plain", title: "Plain", description: "Use plain for a quiet action among other controls in a toolbar." },
    { id: "outline", title: "Outline", description: "Use outline when an isolated action needs a visible boundary." },
    { id: "size-xs", title: "Extra small", description: "Use the 24px size alongside Button's `icon-xs` in dense toolbars." },
    { id: "size-sm", title: "Small", description: "Use the 28px size alongside Button's `icon-sm` in compact control groups." },
    { id: "size-default", title: "Default size", description: "Use the 32px default size alongside Button's `icon` in standard toolbars." },
    { id: "size-lg", title: "Large", description: "Use the 36px size alongside Button's `icon-lg` for a prominent media control." },
    { id: "pressed", title: "Pressed", description: "Use `aria-pressed` for toggles like Repeat that have an on and off state." },
    { id: "disabled", title: "Disabled", description: "Disable the button when its action is temporarily unavailable." },
  ],
  api: [{
    props: [
      { name: "aria-label", type: "string", description: "Required accessible name for the icon-only action." },
      { name: "variant", type: "\"glass\" | \"plain\" | \"outline\"", default: "\"glass\"", description: "Translucent blurred glass, muted plain or hairline outline." },
      { name: "size", type: "\"xs\" | \"sm\" | \"default\" | \"lg\"", default: "\"default\"", description: "Round controls of 24, 28, 32 and 36px in diameter, matching Button's square icon sizes." },
      { name: "aria-pressed", type: "boolean", description: "True shows a brand-coloured fill and an indicator dot." },
      { name: "disabled", type: "boolean", default: "false", description: "Fades the button and prevents activation." },
      { name: "...props", type: "React.ComponentProps<\"button\">", description: "Native button props and ref pass through. `className` is merged and `type` defaults to `button`." },
    ],
  }],
  notes: [
    "Name each button with `aria-label` and mark its icon `aria-hidden`.",
    "Enter and Space activate the button. For toggles, keep the label the same and update `aria-pressed` in `onClick`.",
    "Tune the glass effect with `--wlkr-icon-button-glass-blur`, `--wlkr-icon-button-glass-opacity` and `--wlkr-icon-button-glass-saturation`.",
    "Keyboard focus shows the system focus ring. Hover effects require a fine pointer, and reduced motion removes transitions and press scaling.",
  ],
  related: ["button", "chip"],
  registryDependencies: ["https://ui.wlkr.si/r/theme.json"],
  system: true,
}
