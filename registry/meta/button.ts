import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Button",
  category: "basics",
  order: 1,
  description: "Runs one action when pressed. Six variants, four sizes with square icon twins, a loading state that keeps its width, and a little light when it matters.",
  summary: "A button with six variants, four sizes and matching square icon sizes, width-preserving loading, aria-pressed toggling, asChild links and an optional animated spectrum rim.",
  keywords: ["action", "button", "primary", "secondary", "outline", "ghost", "destructive", "link", "icon", "loading", "glow", "toggle"],
  since: "0.25.0",
  usage: `import { Button } from "@/components/wlkr/button"

<Button variant="outline">Button</Button>`,
  examples: [
    { id: "default", title: "Default", description: "Filled with the foreground colour. Give it to the one action the screen exists for, such as Save or Pay, and drop the actions around it to outline or ghost." },
    { id: "secondary", title: "Secondary", description: "A soft fill for an action that is real but not the main one, like Save draft beside Publish." },
    { id: "outline", title: "Outline", description: "A hairline border on the page background. The natural Cancel next to a filled Save, and the calm default in toolbars." },
    { id: "ghost", title: "Ghost", description: "Only its label until the pointer is over it. Suits repeated, low-stakes actions in a toolbar or a table row." },
    { id: "destructive", title: "Destructive", description: "A red tint for delete, remove and revoke. Put it on the button that confirms the loss, not the one that opens the dialog." },
    { id: "link", title: "Link", description: "Text that underlines on hover and still runs an action. For navigation, render a real link with `asChild` instead." },
    { id: "sizes", title: "Sizes", description: "`xs`, `sm`, `default` and `lg` are 24, 28, 32 and 40px tall, with side padding that grows from 8 to 24px. Each has a square `icon-*` twin of the same height, so text and icon buttons line up." },
    { id: "icon", title: "Icon", description: "A square button with only an icon. Hide the icon from screen readers and name the button with `aria-label`." },
    { id: "with-icon", title: "With icon", description: "Put the icon before the label. Spacing and icon size follow the button size." },
    { id: "loading", title: "Loading", description: "`loading` swaps the label for a spinner without changing the width, sets `aria-busy` and ignores presses until it finishes. Press it to see." },
    { id: "pressed", title: "Pressed", description: "Outline and ghost buttons show an on state from `aria-pressed`, for toggles like repeat or bold." },
    { id: "glow", title: "Glow", description: "A moving spectrum rim with a soft light beneath. Use it on one button per screen at most." },
    { id: "as-child", title: "As child", description: "`asChild` gives a single child, usually a link, the button’s look while it stays a real link. This one jumps to Installation on this page." },
  ],
  api: [{
    props: [
      { name: "variant", type: "\"default\" | \"secondary\" | \"outline\" | \"ghost\" | \"destructive\" | \"link\"", default: "\"default\"", description: "The look. Outline and ghost also show `aria-pressed`." },
      { name: "size", type: "\"xs\" | \"sm\" | \"default\" | \"lg\" | \"icon-xs\" | \"icon-sm\" | \"icon\" | \"icon-lg\"", default: "\"default\"", description: "24, 28, 32 or 40px tall. The `icon-*` sizes are squares of the same heights." },
      { name: "loading", type: "boolean", default: "false", description: "Shows a spinner in place of the label, keeps the width, sets `aria-busy` and blocks presses." },
      { name: "glow", type: "boolean", default: "false", description: "Adds the moving spectrum rim and light. One per screen." },
      { name: "asChild", type: "boolean", default: "false", description: "Renders the single child with the button's look and behaviour." },
      { name: "disabled", type: "boolean", default: "false", description: "Fades the button and blocks presses. Links rendered with `asChild` also leave the tab order." },
      { name: "...props", type: "React.ComponentProps<\"button\">", description: "Native button props and ref pass through; `className` is merged. `type` defaults to `button`." },
    ],
  }],
  notes: [
    "It renders a real `<button>` with `type=\"button\"`, so it never submits a form by accident. Enter and Space press it.",
    "Icon-only buttons need an `aria-label`; mark the icon itself `aria-hidden`.",
    "While loading, the label stays in the accessible name and `aria-busy` is set.",
    "Focus shows a 2px brand ring. Presses scale to 97%, and reduced motion turns that and the glow animation off.",
  ],
  related: ["icon-button", "menu", "segmented"],
  dependencies: ["radix-ui"],
}
