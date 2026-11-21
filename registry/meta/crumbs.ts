import type { ComponentMeta } from "@/lib/component-meta"

export const meta: ComponentMeta = {
  name: "Crumbs",
  category: "navigation",
  description: "Where you are, written like a path. The current page holds the caret.",
  summary: "A mono breadcrumb trail with slash separators, a blinking block caret on the current page and a collapsible middle.",
  keywords: ["breadcrumb", "breadcrumbs", "path", "trail", "navigation", "hierarchy", "location"],
  since: "0.24.0",
  usage: `import { Crumbs } from "@/components/wlkr/crumbs"
import Link from "next/link"

<Crumbs
  items={[
    { label: "wlkr", href: "/" },
    { label: "studio", href: "/studio" },
    { label: "projects", href: "/studio/projects" },
    { label: "pixels", href: "/studio/projects/pixels" },
    { label: "dither.ts" },
  ]}
  renderLink={(item, props) => <Link {...props} />}
/>

<Crumbs items={[{ label: "docs", href: "/docs" }, { label: "crumbs" }]} separator=">" caret={false} />`,
  api: [{
    props: [
      { name: "items", type: "{ label: string; href?: string }[]", description: "The trail from root to the current page. The last item is the current page and is never a link." },
      { name: "max", type: "number", default: "4", description: "Most items shown before the middle collapses into a … button. Keeps the first item and the last max − 1." },
      { name: "separator", type: "React.ReactNode", default: `"/"`, description: "Drawn between items and hidden from assistive technology." },
      { name: "caret", type: "boolean", default: "true", description: "Blinking block caret after the current page." },
      { name: "renderLink", type: "(item, props: { href, className, children }) => React.ReactNode", description: "Render a router link. Spread the props onto it to keep the styling." },
      { name: "className", type: "string", description: "Merged onto the nav. Native nav props pass through." },
    ],
  }],
  notes: [
    "Renders a nav labelled Breadcrumb around an ordered list, with aria-current=\"page\" on the last item.",
    "The … button is a real button with aria-expanded; activating it shows the full trail in place and moves focus to the first revealed link.",
    "Items without an href render as plain text; the separator and caret are hidden from screen readers.",
    "Reduced motion stops the caret blink and the stepped underline draw.",
    "The trail wraps at narrow widths rather than truncating labels.",
  ],
  related: ["pager", "file-tree", "text-link"],
}
