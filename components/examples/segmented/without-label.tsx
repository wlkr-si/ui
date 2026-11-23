import { Segmented } from "@/registry/wlkr/segmented"

export default function SegmentedWithoutLabel() {
  return <Segmented aria-label="Layout" options={[
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" },
  ]} />
}
