import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Chip",
  category: "basics",
  order: 7,
  description: "A small toggle for a filter, or a still marker for a legend.",
  summary: "A pill toggle with controlled or uncontrolled pressed state, optional colour swatch or icon, and a static span variant.",
  keywords: [
    "chip",
    "pill",
    "toggle",
    "legend",
    "filter",
    "swatch",
    "Bach Bench"
  ],
  since: "0.25.0",
  usage: `import { Chip } from "@/components/wlkr/chip"

<Chip swatch="var(--brand)" defaultPressed={true}>Piano</Chip>
<Chip defaultPressed={false}>Harpsichord</Chip>
<Chip as="span" swatch="var(--foreground)">Reference</Chip>`,
  api: [
    {
      props: [
        {
          name: "as",
          type: "\"button\" | \"span\"",
          default: "\"button\"",
          description: "Interactive toggle or static legend."
        },
        {
          name: "pressed",
          type: "boolean",
          description: "Controlled toggle state; aria-pressed is also supported."
        },
        {
          name: "defaultPressed",
          type: "boolean",
          default: "true",
          description: "Initial uncontrolled toggle state."
        },
        {
          name: "onPressedChange",
          type: "(pressed: boolean) => void",
          description: "Called after activation with the next state."
        },
        {
          name: "swatch",
          type: "string",
          description: "CSS colour for the leading dot."
        },
        {
          name: "icon",
          type: "ReactNode",
          description: "Optional decorative leading icon."
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Native button disabled state. Unavailable on static spans."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"button\"> | React.ComponentProps<\"span\">",
          description: "Pass through to the chosen element. className is merged."
        }
      ]
    }
  ],
  notes: [
    "The toggle is a native button with aria-pressed. Enter and Space toggle it; preventDefault in onClick cancels the change.",
    "Unpressed chips dim the swatch or icon. The static span has no toggle semantics, keyboard interaction or hover treatment.",
    "Reduced motion removes transitions and active scaling."
  ],
  related: [
    "segmented",
    "icon-button"
  ]
}
