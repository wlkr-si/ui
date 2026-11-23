import { Segmented } from "@/registry/wlkr/segmented"

export default function SegmentedDisabledGroup() {
  return <Segmented label="Period" defaultValue="week" disabled options={[
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ]} />
}
