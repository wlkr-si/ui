import type { Metadata } from "next"
import { ContrastTool } from "@/components/contrast-tool"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"

export const metadata: Metadata = {
  title: "Contrast — wlkr/ui",
  description: "Check text and background colour contrast against WCAG 2.2 thresholds.",
  alternates: { canonical: "https://ui.wlkr.si/contrast" },
}

export default function ContrastPage() {
  return <div className="site shell"><a href="#contrast" className="sr-only focus:not-sr-only">Skip to contrast checker</a><SiteHeader /><main className="contrast-page" id="contrast" tabIndex={-1}><h1>Contrast</h1><ContrastTool /></main><SiteFooter /></div>
}
