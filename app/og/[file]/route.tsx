import { ImageResponse } from "next/og"
import { getCatalog } from "@/lib/catalog"
import { categories } from "@/lib/component-meta"
import { SocialPreview, socialFont } from "@/lib/social-preview"

export const dynamic = "force-static"
export const dynamicParams = false

/** One share image per component, exported as a real `.png` file so any static host serves it correctly. */
export async function generateStaticParams() {
  return (await getCatalog()).map(entry => ({ file: `${entry.slug}.png` }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const entry = (await getCatalog()).find(item => `${item.slug}.png` === file)
  const category = categories.find(item => item.id === entry?.category)
  return new ImageResponse(<SocialPreview kind="component" name={entry?.name ?? "Components"} eyebrow={category?.name} />, { width: 1200, height: 630, fonts: [socialFont] })
}
