/** Build-time catalog. `pnpm registry:build` regenerates the index from registry/meta; nothing here lists components by hand. */
import { metas } from "./catalog-metas"
import { categories, type CatalogEntry, type CategoryId } from "./component-meta"

export const SITE = "https://ui.wlkr.si"
export const REPOSITORY = "https://github.com/wlkr-si/ui"

/** Already in catalog order: category, then `order`, then name. */
const catalog: CatalogEntry[] = metas.map(([slug, meta]) => ({ ...meta, slug }))

export async function getCatalog(): Promise<CatalogEntry[]> {
  return catalog
}

export type CatalogGroup = { id: CategoryId; name: string; items: CatalogEntry[] }

export async function getGroups(): Promise<CatalogGroup[]> {
  return categories.map(category => ({ ...category, items: catalog.filter(entry => entry.category === category.id) })).filter(group => group.items.length > 0)
}

/** The newest `since` in the catalog marks what is new. */
export async function latestVersion() {
  return catalog.map(entry => entry.since).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).at(-1) ?? ""
}

export function installTarget(entry: CatalogEntry) {
  return entry.install ?? `${SITE}/r/${entry.slug}.json`
}
