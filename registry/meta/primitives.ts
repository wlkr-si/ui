import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Primitives",
  category: "system",
  description: "Good foundations, straight from shadcn/ui. We use the originals, with WLKR’s shared design tokens.",
  summary: "The stock shadcn/ui Button, Input and Switch, used unchanged with the WLKR theme tokens.",
  keywords: ["button", "input", "switch", "shadcn", "stock", "primitives", "radix", "form"],
  since: "0.1.0",
  order: 50,
  registry: false,
  install: "button input switch",
  source: null,
  origin: "shadcn/ui",
  usage: `import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

<Button variant="ghost">Continue</Button>
<label htmlFor="name">Your name</label>
<Input id="name" placeholder="Alex Walker" />
<Switch aria-label="Enable notifications" />`,
  api: [],
  notes: [
    "These install directly from shadcn/ui; their upstream source is unchanged and they are not republished as WLKR items.",
    "The gallery's borderless look comes from the site's own stylesheet, not from edits to the primitives.",
    "Their colours follow the theme tokens, so they switch with light and dark like everything else.",
    "See the shadcn/ui documentation for each primitive's full API.",
  ],
  related: ["theme", "typography"],
}
