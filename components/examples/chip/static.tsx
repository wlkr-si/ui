import { Chip } from "@/registry/wlkr/chip"

export default function ChipStatic() {
  return <Chip as="span" swatch style={{ "--wlkr-chip-color": "#6279d4" }}>Piano</Chip>
}
