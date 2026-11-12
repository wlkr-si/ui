import type { Metadata } from "next"
import { PixelPlayground } from "@/components/pixel-playground"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"

export const metadata: Metadata = {
  title: "Pixels",
  description: "Draw, resize, colour, share and download a pixel mask.",
  alternates: { canonical: "https://ui.wlkr.si/pixels" },
  openGraph: {
    type: "website",
    url: "https://ui.wlkr.si/pixels",
    siteName: "wlkr/ui",
    title: "Pixels",
    description: "Draw, resize, colour, share and download a pixel mask.",
    images: [{ url: "/pixels/opengraph-image", width: 1200, height: 630, type: "image/png", alt: "Pixels tool preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixels",
    description: "Draw, resize, colour, share and download a pixel mask.",
    images: [{ url: "/pixels/opengraph-image", alt: "Pixels tool preview" }],
  },
}
export default function Pixels() {
  return <div className="site shell"><a href="#pixels" className="sr-only focus:not-sr-only">Skip to pixels</a><SiteHeader /><main className="pixels-page" id="pixels" tabIndex={-1}><div className="pixels-heading"><h1>Pixels</h1><a className="pixels-cli-link" href="https://github.com/wlkr-si/ui/blob/main/scripts/pixels.mjs">CLI source</a></div><PixelPlayground focused /></main><SiteFooter /></div>
}
