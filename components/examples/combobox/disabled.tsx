import { Combobox } from "@/registry/wlkr/combobox"

const cities = [
  { value: "montreal", label: "Montréal" },
]

export default function ComboboxDisabled() {
  return <Combobox aria-label="City" placeholder="Find a city" options={cities} disabled />
}
