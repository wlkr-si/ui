import type { Metadata } from "next"
import { ContrastTool } from "@/components/contrast-tool"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"

export const metadata: Metadata = {
  title: "Contrast",
  description: "Check text and background colour contrast against WCAG 2.2 thresholds.",
  alternates: { canonical: "https://ui.wlkr.si/contrast" },
  openGraph: {
    type: "website",
    url: "https://ui.wlkr.si/contrast",
    siteName: "wlkr/ui",
    title: "Contrast",
    description: "Check text and background colour contrast against WCAG 2.2 thresholds.",
    images: [{ url: "/contrast/opengraph-image", width: 1200, height: 630, type: "image/png", alt: "Contrast tool preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contrast",
    description: "Check text and background colour contrast against WCAG 2.2 thresholds.",
    images: [{ url: "/contrast/opengraph-image", alt: "Contrast tool preview" }],
  },
}

export default function ContrastPage() {
  return <div className="site shell"><a href="#contrast" className="sr-only focus:not-sr-only">Skip to contrast checker</a><SiteHeader /><main className="contrast-page" id="contrast" tabIndex={-1}><div className="contrast-heading"><h1>Contrast</h1><a className="contrast-cli-link" href="https://github.com/wlkr-si/ui/blob/main/README.md#contrast-cli">Use CLI</a></div><ContrastTool /></main><SiteFooter /></div>
}
