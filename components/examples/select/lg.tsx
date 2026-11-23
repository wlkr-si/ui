import { Select } from "@/registry/wlkr/select"

export default function SelectLarge() {
  return <Select size="lg" aria-label="Payment frequency">
    <option>Monthly</option>
    <option>Yearly</option>
  </Select>
}
