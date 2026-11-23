import type { MetadataRoute } from "next"
import { getCatalog, SITE } from "@/lib/catalog"

export const dynamic = "force-static"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/components", "/installation", "/system", "/pixels", "/contrast", "/animation"]
  const catalog = await getCatalog()
  return [...pages.map(path => ({ url: `${SITE}${path || "/"}` })), ...catalog.map(entry => ({ url: `${SITE}/components/${entry.slug}` }))]
}
