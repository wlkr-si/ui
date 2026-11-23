import { Combobox } from "@/registry/wlkr/combobox"

const cities = [
  { value: "montreal", label: "Montréal" },
  { value: "sao-paulo", label: "São Paulo" },
]

export function ComboboxDemo() {
  return <div className="flex justify-center">
    <Combobox aria-label="City" placeholder="Find a city" options={cities} />
  </div>
}
