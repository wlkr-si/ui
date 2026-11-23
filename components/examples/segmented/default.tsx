import { Segmented } from "@/registry/wlkr/segmented"

export default function SegmentedDefault() {
  return <Segmented size="default" label="Range" defaultValue="week" options={[
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ]} />
}
