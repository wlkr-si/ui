import { Combobox } from "@/registry/wlkr/combobox"

const cities = [
  { value: "montreal", label: "Montréal" },
]

export default function ComboboxLg() {
  return <Combobox size="lg" aria-label="City" placeholder="Find a city" options={cities} />
}
