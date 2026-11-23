import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Card",
  category: "basics",
  order: 9,
  description: "A frame for content, with a title, tools and a quiet caption.",
  summary: "A Bach Bench card frame with seven composable sections, a 12px radius, hairline border and theme-aware surface.",
  keywords: [
    "card",
    "frame",
    "panel",
    "header",
    "caption",
    "Bach Bench"
  ],
  since: "0.25.0",
  usage: `import { Card, CardHeader, CardTitle, CardTools, CardContent, CardFooter, CardCaption } from "@/components/wlkr/card"

<Card>
  <CardHeader>
    <CardTitle>Recordings</CardTitle>
    <CardTools>{/* Actions */}</CardTools>
  </CardHeader>
  <CardContent>Goldberg Variations</CardContent>
  <CardFooter><CardCaption>Recorded in Leipzig, 2026.</CardCaption></CardFooter>
</Card>`,
  api: [
    {
      title: "Card",
      props: [
        {
          name: "children",
          type: "ReactNode",
          description: "Outer 12px frame with hairline border and themed card surface."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"div\">",
          description: "Native div props and ref pass through. className is merged on the root."
        }
      ]
    },
    {
      title: "CardHeader",
      props: [
        {
          name: "children",
          type: "ReactNode",
          description: "Wrapping row for a title and tools."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"div\">",
          description: "Native div props and ref pass through. className is merged on the root."
        }
      ]
    },
    {
      title: "CardTitle",
      props: [
        {
          name: "children",
          type: "ReactNode",
          description: "Flexible 15px semibold heading."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"h3\">",
          description: "Native h3 props and ref pass through. className is merged on the root."
        }
      ]
    },
    {
      title: "CardTools",
      props: [
        {
          name: "children",
          type: "ReactNode",
          description: "Right-aligned slot for controls."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"div\">",
          description: "Native div props and ref pass through. className is merged on the root."
        }
      ]
    },
    {
      title: "CardContent",
      props: [
        {
          name: "children",
          type: "ReactNode",
          description: "Main content with 6px top spacing."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"div\">",
          description: "Native div props and ref pass through. className is merged on the root."
        }
      ]
    },
    {
      title: "CardFooter",
      props: [
        {
          name: "children",
          type: "ReactNode",
          description: "Footer with 14px top spacing."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"div\">",
          description: "Native div props and ref pass through. className is merged on the root."
        }
      ]
    },
    {
      title: "CardCaption",
      props: [
        {
          name: "children",
          type: "ReactNode",
          description: "Muted italic caption, up to 76 characters wide."
        },
        {
          name: "Native props and ref",
          type: "React.ComponentProps<\"p\">",
          description: "Native p props and ref pass through. className is merged on the root."
        }
      ]
    }
  ],
  notes: [
    "The card is a layout container, not an interactive control. Give nested controls their own accessible names.",
    "CardTitle renders h3. Match the surrounding document heading order when composing the screen.",
    "All sections forward native props and refs; the frame supplies their shared styles."
  ],
  related: [
    "stat",
    "menu"
  ]
}
