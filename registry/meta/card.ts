import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Card",
  category: "basics",
  order: 9,
  description: "Group related content, headings and controls in a raised panel.",
  summary: "A raised panel with composable slots for a heading, tools, content and a footer.",
  keywords: ["card", "surface", "panel", "header", "caption"],
  since: "0.25.0",
  system: true,
  registryDependencies: ["https://ui.wlkr.si/r/theme.json"],
  usage: `import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardCaption } from "@/components/wlkr/card"

<Card>
  <CardHeader>
    <CardTitle>Goldberg Variations</CardTitle>
  </CardHeader>
  <CardContent>Johann Sebastian Bach</CardContent>
  <CardFooter><CardCaption>Recorded in Leipzig, 2026</CardCaption></CardFooter>
</Card>`,
  examples: [
    { id: "content", title: "Content only", description: "Use a card on its own to group content that already has a heading nearby." },
    { id: "with-tools", title: "Header with tools", description: "Put a control beside the title when it acts on the card's content." },
    { id: "with-caption", title: "Footer with caption", description: "Put supporting details such as a source or date in the footer." }
  ],
  api: [
    {
      title: "Card",
      props: [
        {
          name: "children",
          type: "ReactNode",
          description: "Content to place inside the raised surface."
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
          description: "Semibold heading in the text-md size."
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
          description: "Controls placed at the end of the header."
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
          description: "Main content of the card."
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
          description: "Supporting content or controls below the main content."
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
          description: "Supporting text in the text-xs size and content-secondary colour."
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
    "Give each control inside the card an accessible name.",
    "CardTitle renders h3. Match the surrounding document heading order when composing the screen.",
    "All sections are optional. Card supplies the surface and spacing between sections."
  ],
  related: [
    "stat",
    "menu"
  ]
}
