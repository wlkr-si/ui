import { Combobox } from "@/registry/wlkr/combobox"

const cities = [
  { value: "bogota", label: "Bogotá" },
  { value: "montreal", label: "Montréal" },
]

export default function ComboboxSelected() {
  return <Combobox aria-label="City" options={cities} defaultValue="montreal" />
}
