import { readFileSync } from "node:fs"
import { starterMask } from "./pixel-mask"

const mark = "data:image/svg+xml;base64," + readFileSync("public/wlkr-mark-dark.svg").toString("base64")
const endorsement = "data:image/svg+xml;base64," + readFileSync("public/brand/part-of-wlkr-si-dark.svg").toString("base64")
export const socialFont = { name: "Geist", data: readFileSync("node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"), weight: 400 as const, style: "normal" as const }
const green = "#33F282"
const white = "#F7F7F7"
const black = "#010101"

type PreviewKind = "gallery" | "pixels" | "contrast"

function PixelArt({ cell = 24, gap = 6 }: { cell?: number; gap?: number }) {
  return <div style={{ display: "flex", flexDirection: "column", gap }}>
    {starterMask().map((row, y) => <div key={y} style={{ display: "flex", gap, flexShrink: 0 }}>{[...row].map((value, x) => <div key={x} style={{ width: cell, height: cell, flexShrink: 0, borderRadius: 2, background: value === "#" ? green : "transparent" }} />)}</div>)}
  </div>
}

function GalleryTiles() {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 16, width: 430 }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 152, width: 207, padding: 18, background: "#111111", border: "1px solid #303030" }}>
      <div style={{ display: "flex", marginTop: 18, alignItems: "center", justifyContent: "center", background: green, color: black, fontSize: 17, height: 44, width: 126 }}>Continue</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 152, width: 207, padding: 18, background: "#111111", border: "1px solid #303030" }}>
      <div style={{ display: "flex", justifyContent: "center" }}><PixelArt cell={10} gap={3} /></div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 112, width: 207, padding: 18, background: "#111111", border: "1px solid #303030" }}>
      <div style={{ display: "flex", alignItems: "center", height: 38, paddingLeft: 12, color: "#F7F7F7", borderBottom: "1px solid #565656", fontSize: 16 }}>Your email</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 112, width: 207, padding: 18, background: "#111111", border: "1px solid #303030" }}>
      <div style={{ display: "flex", gap: 10, }}>
        {[green, "#F7F7F7", "#696969", "#343434"].map(color => <div key={color} style={{ width: 28, height: 28, background: color }} />)}
      </div>
    </div>
  </div>
}

function ContrastSample() {
  return <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 410, height: 300, padding: 32, background: "#FFFFFF", color: "#010101", borderRadius: 4 }}>
    <span style={{ fontSize: 78, lineHeight: 1 }}>Aa</span>
    <span style={{ marginTop: 28, fontSize: 18 }}>#010101 on #FFFFFF</span>
  </div>
}

export function SocialPreview({ kind }: { kind: PreviewKind }) {
  const title = kind === "gallery" ? "Components" : kind === "pixels" ? "Pixels" : "Contrast"
  const art = kind === "gallery" ? <GalleryTiles /> : kind === "pixels"
    ? <div style={{ display: "flex", width: 430, height: 300, alignItems: "center", justifyContent: "center", background: "#111111", border: "1px solid #303030" }}><PixelArt /></div>
    : <ContrastSample />

  return <div style={{ position: "relative", display: "flex", width: 1200, height: 630, background: black, color: white, fontFamily: "Geist" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 8, background: green }} />
    <div style={{ position: "absolute", left: 64, top: 46, width: 1072, height: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og rasterizes this local SVG into the build-time PNG */}
        <img src={mark} alt="" width={38} height={38} />
        <span style={{ fontSize: 22, fontWeight: 600 }}>wlkr/ui</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og rasterizes this local SVG into the build-time PNG */}
      <img src={endorsement} alt="Part of WLKR.SI" width={184} height={32} />
    </div>
    <div style={{ position: "absolute", left: 64, top: 144, width: 1072, height: 350, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 48 }}>
      <div style={{ display: "flex", flexDirection: "column", width: 490 }}>
        <span style={{ marginTop: 18, fontSize: 72, lineHeight: 1.04, letterSpacing: -3, fontWeight: 600 }}>{title}</span>
      </div>
      {art}
    </div>
    <div style={{ position: "absolute", left: 64, bottom: 46, width: 1072, height: 40, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #343434", paddingTop: 18, color: "#A0A0A0", fontSize: 16 }}>
      <span>ui.wlkr.si</span>
    </div>
  </div>
}
