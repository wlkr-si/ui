import { readFileSync } from "node:fs"

const mark = "data:image/svg+xml;base64," + readFileSync("public/wlkr-mark-dark.svg").toString("base64")
const endorsement = "data:image/svg+xml;base64," + readFileSync("public/brand/part-of-wlkr-si-dark.svg").toString("base64")
export const socialFont = { name: "Geist", data: readFileSync("node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"), weight: 400 as const, style: "normal" as const }
const green = "#33F282"
const white = "#F7F7F7"
const black = "#010101"

type PreviewKind = "gallery" | "pixels" | "contrast"

const sphere = Array.from({ length: 15 }, (_, y) =>
  Array.from({ length: 15 }, (_, x) => {
    const dx = (x - 7) / 6.5
    const dy = (y - 7) / 6.5
    const visible = dx * dx + dy * dy <= 1
    const lit = visible && dx * -0.45 + dy * -0.25 > 0.12
    return visible ? (lit ? green : white) : "transparent"
  }),
)

function PixelSphere() {
  return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {sphere.map((row, y) => <div key={y} style={{ display: "flex", gap: 4 }}>{row.map((color, x) => <div key={x} style={{ width: 12, height: 12, borderRadius: 2, background: color }} />)}</div>)}
  </div>
}

function GalleryTiles() {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 16, width: 430 }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 152, width: 207, padding: 18, background: "#111111", border: "1px solid #303030" }}>
      <div style={{ display: "flex", marginTop: 18, alignItems: "center", justifyContent: "center", background: green, color: black, fontSize: 17, height: 44, width: 126 }}>Continue</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 152, width: 207, padding: 18, background: "#111111", border: "1px solid #303030" }}>
      <div style={{ display: "flex", justifyContent: "center" }}><PixelSphere /></div>
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
    ? <div style={{ display: "flex", width: 430, height: 300, alignItems: "center", justifyContent: "center", background: "#111111", border: "1px solid #303030" }}><PixelSphere /></div>
    : <ContrastSample />

  return <div style={{ display: "flex", flexDirection: "column", width: 1200, height: 630, padding: "46px 64px", background: black, color: white, fontFamily: "Geist", borderTop: "8px solid " + green }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og rasterizes this local SVG into the build-time PNG */}
        <img src={mark} alt="" width={38} height={38} />
        <span style={{ fontSize: 22, fontWeight: 600 }}>wlkr/ui</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og rasterizes this local SVG into the build-time PNG */}
      <img src={endorsement} alt="Part of WLKR.SI" width={184} height={32} />
    </div>
    <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", gap: 48 }}>
      <div style={{ display: "flex", flexDirection: "column", width: 490 }}>
        <span style={{ marginTop: 18, fontSize: 72, lineHeight: 1.04, letterSpacing: -3, fontWeight: 600 }}>{title}</span>
      </div>
      {art}
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #343434", paddingTop: 18, color: "#A0A0A0", fontSize: 16 }}>
      <span>ui.wlkr.si</span>
    </div>
  </div>
}
