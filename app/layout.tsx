import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
const geist = localFont({ src: "../public/fonts/geist-latin-wght-normal.woff2", variable: "--font-geist-sans", display: "swap" })
export const metadata: Metadata = {
  metadataBase: new URL("https://ui.wlkr.si"),
  title: { default: "wlkr/ui", template: "%s — wlkr/ui" },
  description: "Source-first React components, a shadcn registry, and interactive design tools.",
  alternates: { canonical: "https://ui.wlkr.si/" },
  openGraph: {
    type: "website",
    url: "https://ui.wlkr.si/",
    siteName: "wlkr/ui",
    title: "wlkr/ui",
    description: "Source-first React components, a shadcn registry, and interactive design tools.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "wlkr/ui component gallery" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "wlkr/ui",
    description: "Source-first React components, a shadcn registry, and interactive design tools.",
    images: [{ url: "/opengraph-image", alt: "wlkr/ui component gallery" }],
  },
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`try{const t=localStorage.getItem('wlkr-theme');document.documentElement.classList.toggle('dark',t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))}catch{}`}} /></head><body className={`${geist.variable} antialiased`}>{children}</body></html>
}
