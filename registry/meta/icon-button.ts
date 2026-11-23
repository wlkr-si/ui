import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Icon button",
  category: "basics",
  order: 2,
  description: "One icon in a round control. Glass, plain or outlined.",
  summary: "A round icon-only button with glass, plain and outline variants, three sizes and a brand-coloured pressed indicator.",
  keywords: [
    "icon",
    "button",
    "glass",
    "round",
    "pressed",
    "toolbar",
    "Bach Bench"
  ],
  since: "0.25.0",
  origin: "Bach Bench",
  usage: `import { Play } from "lucide-react"
import { IconButton } from "@/components/wlkr/icon-button"

<IconButton aria-label="Play"><Play aria-hidden="true" /></IconButton>
<IconButton variant="plain" size="lg" aria-label="Repeat" aria-pressed={true}>
  <Play aria-hidden="true" />
</IconButton>`,
  api: [
    {
      props: [
        {
          name: "aria-label",
          type: "string",
          description: "Required accessible name for the icon-only action."
        },
        {
          name: "variant",
          type: "\"glass\" | \"plain\" | \"outline\"",
          default: "\"glass\"",
          description: "Translucent blurred glass, muted plain or hairline outline."
        },
        {
          name: "size",
          type: "\"sm\" | \"md\" | \"lg\"",
          default: "\"md\"",
          description: "32, 40 or 44px square."
        },
        {
          name: "aria-pressed",
          type: "boolean",
          description: "True adds the brand colour and small indicator dot."
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Uses the native disabled state."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"button\">",
          description: "Native button props and ref pass through. className is merged on the root."
        }
      ]
    }
  ],
  notes: [
    "aria-label is required in TypeScript. Mark decorative icons aria-hidden.",
    "Enter and Space activate the native button. Toggle actions should supply aria-pressed and update it in onClick.",
    "Reduced motion removes transitions and press scaling. Hover effects require a fine pointer."
  ],
  related: [
    "button",
    "chip"
  ]
}
