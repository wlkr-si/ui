import { ImageResponse } from "next/og"
import { SocialPreview, socialFont } from "@/lib/social-preview"

export const alt = "wlkr/ui component gallery"
export const dynamic = "force-static"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(<SocialPreview kind="gallery" />, { ...size, fonts: [socialFont] })
}
