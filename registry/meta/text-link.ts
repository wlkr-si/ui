import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Text link",
  category: "navigation",
  description: "A link that stays a link. Add an optional preview when a little context helps someone choose.",
  summary: "A normal text link with an optional keyboard-accessible Radix HoverCard preview.",
  keywords: ["link", "hover", "card", "preview", "focus", "navigation"],
  since: "0.1.0",
  order: 30,
  usage: `import { TextLink } from "@/components/wlkr/text-link"

<p>
  Take a look around{" "}
  <TextLink
    href="https://wlkr.si"
    preview={{ title: "WLKR.SI", description: "A small studio building useful things." }}
  >
    the studio
  </TextLink>
  , or <TextLink href="/installation">bring a component home</TextLink>.
</p>`,
  api: [{
    props: [
      { name: "preview", type: "{ title: string; description?: string; image?: string; imageAlt?: string }", description: "Optional card shown on hover and keyboard focus. Without it, this is a plain link." },
      { name: "children", type: "React.ReactNode", description: "The link text." },
      { name: "className", type: "string", description: "Merged onto the anchor." },
      { name: "...props", type: "React.ComponentProps<\"a\">", description: "Other anchor props are passed through, including onFocus, onBlur and onKeyDown." },
    ],
  }],
  notes: [
    "The anchor always navigates normally on click or Enter; the preview never replaces it.",
    "The preview opens on hover after 180 ms and on keyboard focus, and Escape or blur closes it. While open it describes the link.",
    "Calling preventDefault in your own onFocus keeps the preview closed for that focus.",
    "Keep essential information in the link text or page. The preview is supplemental and may not be reached on touch.",
    "Reduced motion removes the underline transition and the card animation.",
  ],
  registryDependencies: ["hover-card"],
  related: ["index-row", "decode-text"],
}
