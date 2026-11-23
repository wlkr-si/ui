import { Segmented } from "@/registry/wlkr/segmented"

export default function SegmentedDisabledOption() {
  return <Segmented label="Period" options={[
    { value: "day", label: "Day" },
    { value: "week", label: "Week", disabled: true },
    { value: "month", label: "Month" },
  ]} />
}
