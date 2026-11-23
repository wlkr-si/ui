import { Select } from "@/registry/wlkr/select"

export default function SelectExtraSmall() {
  return <Select size="xs" aria-label="Rows per page">
    <option>25 rows</option>
    <option>50 rows</option>
  </Select>
}
