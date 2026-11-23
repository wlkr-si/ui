import { Segmented } from "@/registry/wlkr/segmented"

export default function SegmentedSmall() {
  return <Segmented size="sm" label="Sort" options={[
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ]} />
}
