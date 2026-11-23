import { Segmented } from "@/registry/wlkr/segmented"

export function SegmentedDemo() {
  return <div className="flex justify-center">
    <Segmented label="View" defaultValue="week" options={[
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
    ]} />
  </div>
}
