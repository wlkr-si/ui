import { Combobox } from "@/registry/wlkr/combobox"

const cities = [
  { value: "montreal", label: "Montréal" },
]

export default function ComboboxReadOnly() {
  return <Combobox aria-label="City" options={cities} defaultValue="montreal" readOnly />
}
