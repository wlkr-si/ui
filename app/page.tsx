import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getCatalog, getGroups, latestVersion, SITE } from "@/lib/catalog"
import { demos } from "@/lib/catalog-demos"
import { CatalogGrid } from "@/components/docs/catalog-grid"
import { LegacyLinks } from "@/components/docs/legacy-links"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"
import { CopyCommand } from "@/registry/wlkr/copy-command"
import { DotField } from "@/registry/wlkr/dot-field"

const featured = ["rolling-number", "liquid-tabs", "pixel-slider", "pixel-avatar", "heat-grid", "marker"]

export default async function Home() {
  const [catalog, groups, fresh] = await Promise.all([getCatalog(), getGroups(), latestVersion()])
  const tiles = featured.map(slug => {
    const entry = catalog.find(item => item.slug === slug)
    return entry ? { entry, Demo: demos[slug] } : null
  })
  return <div className="site shell">
    <a href="#collection" className="sr-only focus:not-sr-only">Skip to components</a>
    <LegacyLinks slugs={catalog.map(entry => entry.slug)} />
    <SiteHeader />
    <main>
      <DotField className="home-hero" radius={150}>
        <div className="home-hero-inner">
          <h1>Interfaces,<br />reduced.</h1>
          <div className="home-start">
            <CopyCommand command={`pnpm dlx shadcn@latest add ${SITE}/r/dot-field.json`} />
            <Link className="home-browse" href="/components" prefetch={false}>Browse {catalog.length} components <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </DotField>
      <ul className="home-featured" aria-label="Featured components">
        {tiles.map(tile => tile && <li key={tile.entry.slug}>
          <div className="home-tile"><tile.Demo /></div>
          <Link href={`/components/${tile.entry.slug}`} prefetch={false}>{tile.entry.name} <ArrowRight aria-hidden="true" /></Link>
        </li>)}
      </ul>
      <div id="collection" className="home-collection">
        <CatalogGrid groups={groups} fresh={fresh} />
      </div>
    </main>
    <SiteFooter />
  </div>
}
