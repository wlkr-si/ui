import { getGroups, latestVersion } from "@/lib/catalog"
import { DocsSidebar } from "@/components/docs/sidebar"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const [groups, fresh] = await Promise.all([getGroups(), latestVersion()])
  const sidebar = groups.map(group => ({
    id: group.id,
    name: group.name,
    items: group.items.map(entry => ({ slug: entry.slug, name: entry.name, search: `${entry.name} ${entry.keywords.join(" ")} ${group.name}`.toLowerCase(), fresh: entry.since === fresh })),
  }))
  const total = groups.reduce((count, group) => count + group.items.length, 0)
  return <div className="site shell">
    <a href="#content" className="sr-only focus:not-sr-only">Skip to content</a>
    <SiteHeader />
    <div className="docs">
      <DocsSidebar groups={sidebar} total={total} />
      <main id="content" className="docs-main" tabIndex={-1}>{children}</main>
    </div>
    <SiteFooter />
  </div>
}
