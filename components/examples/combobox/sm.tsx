import { Combobox } from "@/registry/wlkr/combobox"

const cities = [
  { value: "bogota", label: "Bogotá" },
  { value: "montreal", label: "Montréal" },
]

export default function ComboboxSm() {
  return <Combobox size="sm" aria-label="City" placeholder="Find a city" options={cities} />
}
