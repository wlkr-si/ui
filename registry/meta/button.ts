import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Button",
  category: "basics",
  order: 1,
  description: "An everyday action. Solid, outlined or quiet, with a little light when it matters.",
  summary: "A Bach Bench button with four variants, three sizes, width-preserving loading and an optional animated spectrum rim.",
  keywords: [
    "action",
    "button",
    "solid",
    "outline",
    "quiet",
    "destructive",
    "glow",
    "loading",
    "Bach Bench"
  ],
  since: "0.25.0",
  origin: "Bach Bench",
  usage: `import { Button } from "@/components/wlkr/button"

<Button>Save</Button>
<Button variant="outline" aria-pressed={true}>Repeat</Button>
<Button variant="quiet" size="sm">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button glow size="lg">Listen</Button>
<Button loading>Saving</Button>
<Button asChild><a href="/recordings">Recordings</a></Button>`,
  api: [
    {
      props: [
        {
          name: "variant",
          type: "\"solid\" | \"outline\" | \"quiet\" | \"destructive\"",
          default: "\"solid\"",
          description: "Solid uses ink on paper; outline supports aria-pressed."
        },
        {
          name: "size",
          type: "\"sm\" | \"md\" | \"lg\"",
          default: "\"md\"",
          description: "28, 32 or 40px high; sm uses 12px text."
        },
        {
          name: "glow",
          type: "boolean",
          default: "false",
          description: "Adds the Bach spectrum rim and light. Use at most once per screen."
        },
        {
          name: "loading",
          type: "boolean",
          default: "false",
          description: "Shows a ring, sets aria-busy and blocks activation while preserving the label width."
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Merges behaviour onto a single child through Radix Slot."
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Dims and blocks activation. Slotted links also leave the tab order."
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
    "Native buttons support Enter and Space; links keep native link keyboard behaviour. The default button type is button.",
    "The original label stays accessible while loading. Provide an aria-label for icon-only content, or use Icon button.",
    "Icons sit 6px from the label. Focus uses the brand ring; active presses scale to .97.",
    "Reduced motion stops the spinner and spectrum animations, transitions and press scaling."
  ],
  related: [
    "icon-button",
    "menu"
  ],
  dependencies: [
    "radix-ui"
  ]
}
