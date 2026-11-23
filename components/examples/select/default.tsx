import { Select } from "@/registry/wlkr/select"

export default function SelectDefault() {
  return <Select aria-label="Delivery method">
    <option>Standard</option>
    <option>Express</option>
  </Select>
}
