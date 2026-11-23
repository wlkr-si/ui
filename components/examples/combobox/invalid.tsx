import { Combobox } from "@/registry/wlkr/combobox"

const cities = [
  { value: "montreal", label: "Montréal" },
]

export default function ComboboxInvalid() {
  return <Combobox aria-label="City" placeholder="Choose a city" options={cities} aria-invalid />
}
