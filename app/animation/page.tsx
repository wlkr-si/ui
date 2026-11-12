import type { Metadata } from "next"
import { AnimationRoom } from "@/components/animation-room"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"

export const metadata: Metadata = {
  title: "Animation room",
  description: "Tune the Open Lens arc, cut-through motion and logo hover.",
  alternates: { canonical: "https://ui.wlkr.si/animation" },
  openGraph: { type: "website", url: "https://ui.wlkr.si/animation", siteName: "wlkr/ui", title: "Animation room", description: "Tune the Open Lens arc, cut-through motion and logo hover.", images: [{ url: "/opengraph-image", width: 1200, height: 630, type: "image/png", alt: "wlkr/ui" }] },
  twitter: { card: "summary_large_image", title: "Animation room", description: "Tune the Open Lens arc, cut-through motion and logo hover.", images: ["/opengraph-image"] },
}
export default function Animation() {
  return <div className="site shell"><a href="#animation" className="sr-only focus:not-sr-only">Skip to animation room</a><SiteHeader /><main id="animation" tabIndex={-1}><div className="pixels-heading"><h1>Animation room</h1></div><AnimationRoom /></main><SiteFooter /></div>
}
