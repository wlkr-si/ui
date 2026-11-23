import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Chip",
  category: "basics",
  order: 7,
  description: "Toggles a filter or labels an item in a legend.",
  summary: "A small pill toggle or static legend label with an optional leading colour swatch or icon.",
  keywords: ["chip", "pill", "toggle", "legend", "filter", "swatch"],
  since: "0.25.0",
  usage: `import { Chip } from "@/components/wlkr/chip"

<Chip size="xs" defaultPressed={false}>Piano</Chip>
<Chip as="span" swatch style={{ "--wlkr-chip-color": "#6279d4" }}>Piano</Chip>`,
  examples: [
    { id: "pressed", title: "Pressed", description: "Start pressed when the filter already applies." },
    { id: "unpressed", title: "Unpressed", description: "Start unpressed when the filter is available to turn on." },
    { id: "xs", title: "Extra small", description: "Use the 24px size alongside extra-small Buttons in dense toolbars." },
    { id: "sm", title: "Small", description: "Use the default 28px size alongside small Buttons." },
    { id: "static", title: "Static", description: "Render a span to label a series in a legend." },
    { id: "swatch", title: "Swatch", description: "Add a swatch when the filter corresponds to a colour in a chart or map." },
    { id: "icon", title: "Icon", description: "Add a leading icon when it helps readers recognise the filter." },
    { id: "disabled", title: "Disabled", description: "Disable a filter when it is temporarily unavailable." },
  ],
  api: [{
    props: [
      { name: "as", type: "\"button\" | \"span\"", default: "\"button\"", description: "Interactive toggle or static legend label." },
      { name: "size", type: "\"xs\" | \"sm\"", default: "\"sm\"", description: "24px or 28px tall, matching the same Button sizes." },
      { name: "pressed", type: "boolean", description: "Controlled toggle state, also accepted as `aria-pressed`." },
      { name: "defaultPressed", type: "boolean", default: "true", description: "Initial uncontrolled toggle state." },
      { name: "onPressedChange", type: "(pressed: boolean) => void", description: "Called after activation with the next state." },
      { name: "swatch", type: "boolean", default: "false", description: "Shows a leading dot using the caller's `--wlkr-chip-color`." },
      { name: "icon", type: "ReactNode", description: "Decorative leading icon as an alternative to the swatch." },
      { name: "disabled", type: "boolean", default: "false", description: "Dims the button and blocks activation." },
      { name: "...props", type: "React.ComponentProps<\"button\"> | React.ComponentProps<\"span\">", description: "Native props and ref pass through to the chosen element, and `className` is merged." },
    ],
  }],
  notes: [
    "The native button exposes `aria-pressed` and responds to Enter and Space. Call `preventDefault()` in `onClick` to cancel a toggle.",
    "The label names the chip for assistive technology. The swatch and icon are decorative.",
    "Set `--wlkr-chip-color` on a chip or an ancestor when using `swatch`. This CSS variable carries caller data, such as a chart series colour.",
    "Use `as=\"span\"` for a static legend label. Reduced motion turns off button transitions and press scaling.",
  ],
  related: ["segmented", "icon-button"],
  registryDependencies: ["https://ui.wlkr.si/r/theme.json"],
  system: true,
}
