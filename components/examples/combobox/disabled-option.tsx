import { Combobox } from "@/registry/wlkr/combobox"

const cities = [
  { value: "montreal", label: "Montréal", disabled: true },
  { value: "sao-paulo", label: "São Paulo" },
]

export default function ComboboxDisabledOption() {
  return <Combobox aria-label="City" placeholder="Find a city" options={cities} />
}
