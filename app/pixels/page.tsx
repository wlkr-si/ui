import type { Metadata } from "next"
import { PixelPlayground } from "@/components/pixel-playground"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"

export const metadata: Metadata = {
  title: "Pixels — wlkr/ui",
  description: "Draw, resize, colour, share and download a pixel mask.",
  alternates: { canonical: "https://ui.wlkr.si/pixels" },
}
export default function Pixels() {
  return <div className="site shell"><a href="#pixels" className="sr-only focus:not-sr-only">Skip to pixels</a><SiteHeader /><main className="pixels-page" id="pixels" tabIndex={-1}><h1>Pixels</h1><PixelPlayground focused /></main><SiteFooter /></div>
}
