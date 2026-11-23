/** The catalog's shape. One `registry/meta/<slug>.ts` file per component is the single source for the
 *  gallery page, the sidebar, search, and the component's registry entry. */

export const categories = [
  { id: "basics", name: "Basics" },
  { id: "actions", name: "Actions" },
  { id: "inputs", name: "Inputs" },
  { id: "navigation", name: "Navigation" },
  { id: "feedback", name: "Feedback" },
  { id: "data", name: "Data" },
  { id: "text", name: "Text" },
  { id: "media", name: "Media" },
  { id: "effects", name: "Effects" },
  { id: "system", name: "System" },
] as const

export type CategoryId = (typeof categories)[number]["id"]

export type PropRow = {
  name: string
  /** TypeScript type, written as a reader would want to see it. */
  type: string
  /** Omit for required props; write "required" only in `description` if it needs saying. */
  default?: string
  description: string
}

export type ComponentMeta = {
  name: string
  category: CategoryId
  /** Gallery blurb in the studio voice: one or two short, calm sentences. */
  description: string
  /** One factual sentence for the registry catalog and search engines. */
  summary: string
  keywords: string[]
  /** Package version that introduced it, e.g. "0.23.0". */
  since: string
  /** Copy-paste example. Imports come from `@/components/wlkr/<slug>`. */
  usage: string
  /** One table per exported component (most have one; leave `title` off then). */
  api: { title?: string; props: PropRow[]; /** Column headings when the rows are not props, e.g. { name: "Class", type: "Kind" }. */ columns?: { name?: string; type?: string } }[]
  /** Focused examples, one per section. Each lives at `components/examples/<slug>/<id>.tsx` with a default export;
   *  the page shows it live beside its own source. */
  examples?: { id: string; title: string; description: string; stage?: "center" | "fill" }[]
  /** Behaviour worth knowing: keyboard, reduced motion, limits, accessibility. Plain sentences. */
  notes: string[]
  /** npm packages the component imports (besides react). */
  dependencies?: string[]
  /** Stock shadcn items the component imports, by official name. */
  registryDependencies?: string[]
  /** Extra registry files beyond `registry/wlkr/<slug>.tsx`. */
  files?: { path: string; type: string; target: string }[]
  /** Slugs worth seeing next. */
  related?: string[]
  /** "center" sits the demo in a padded stage. "fill" lets it run edge to edge. "plain" drops the stage surface. */
  stage?: "center" | "fill" | "plain"
  /** Position inside its category; lower comes first. Unset sorts after, by name. */
  order?: number
  /** False for pages whose registry item is maintained by hand (theme, typography) or that have none. */
  registry?: false
  /** What follows `shadcn@latest add` when it is not this component's own registry URL. */
  install?: string
  /** Source file shown on the page. Defaults to `registry/wlkr/<slug>.tsx`; null hides it. */
  source?: string | null
  /** Label beside the category on the page. Defaults to "WLKR original". */
  origin?: string
}

export type CatalogEntry = ComponentMeta & { slug: string }
