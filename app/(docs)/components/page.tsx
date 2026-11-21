import type { Metadata } from "next"
import { getCatalog, getGroups, latestVersion, SITE } from "@/lib/catalog"
import { CatalogGrid } from "@/components/docs/catalog-grid"

const description = "Every wlkr/ui component, grouped by what it does. Copy the source into your project with the shadcn CLI."
export const metadata: Metadata = {
  title: "Components",
  description,
  alternates: { canonical: `${SITE}/components` },
  openGraph: { type: "website", url: `${SITE}/components`, siteName: "wlkr/ui", title: "Components", description, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "wlkr/ui component gallery" }] },
}

export default async function Components() {
  const [catalog, groups, fresh] = await Promise.all([getCatalog(), getGroups(), latestVersion()])
  return <div className="doc-index">
    <header className="doc-head">
      <p className="doc-eyebrow">{catalog.length} components</p>
      <h1>Components</h1>
    </header>
    <CatalogGrid groups={groups} fresh={fresh} />
  </div>
}
