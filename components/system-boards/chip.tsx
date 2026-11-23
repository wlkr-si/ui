import { Star } from "lucide-react"
import { Chip } from "@/registry/wlkr/chip"

const sizes = ["xs", "sm"] as const

export default function ChipBoard() {
  return <>
    <div className="sys-board-row"><code>toggle</code><div>
      {sizes.map(size => <span className="sys-board-pair" key={size}>
        <Chip size={size}>Filter</Chip>
        <Chip size={size} swatch style={{ "--wlkr-chip-color": "#6279d4" }}>Piano</Chip>
        <Chip size={size} icon={<Star />}>Starred</Chip>
      </span>)}
    </div></div>
    <div className="sys-board-row"><code>static</code><div>
      {sizes.map(size => <span className="sys-board-pair" key={size}>
        <Chip as="span" size={size}>Legend</Chip>
        <Chip as="span" size={size} swatch style={{ "--wlkr-chip-color": "#6279d4" }}>Piano</Chip>
        <Chip as="span" size={size} icon={<Star />}>Starred</Chip>
      </span>)}
    </div></div>
    <div className="sys-board-row"><code>states</code><div>
      <Chip>Pressed</Chip>
      <Chip defaultPressed={false}>Unpressed</Chip>
      <Chip disabled>Disabled</Chip>
    </div></div>
  </>
}
