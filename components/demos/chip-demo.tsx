import { Chip } from "@/registry/wlkr/chip"

export function ChipDemo() {
  return <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Instrument filters">
    <Chip swatch style={{ "--wlkr-chip-color": "#6279d4" }}>Piano</Chip>
    <Chip swatch style={{ "--wlkr-chip-color": "#c16694" }} defaultPressed={false}>Strings</Chip>
  </div>
}
