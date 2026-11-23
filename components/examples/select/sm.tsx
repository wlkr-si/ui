import { Select } from "@/registry/wlkr/select"

export default function SelectSmall() {
  return <Select size="sm" aria-label="Time range">
    <option>This week</option>
    <option>This month</option>
  </Select>
}
