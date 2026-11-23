import { Select } from "@/registry/wlkr/select"

export default function SelectDisabled() {
  return <Select aria-label="Billing cycle" disabled>
    <option>Monthly</option>
  </Select>
}
