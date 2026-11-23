import { Select } from "@/registry/wlkr/select"

export default function SelectInvalid() {
  return <Select aria-label="Delivery region" aria-invalid required defaultValue="">
    <option value="" disabled>Choose a region</option>
    <option value="north">North</option>
    <option value="south">South</option>
  </Select>
}
