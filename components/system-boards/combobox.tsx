import { Combobox } from "@/registry/wlkr/combobox"

const cities = [
  { value: "bogota", label: "Bogotá" },
  { value: "montreal", label: "Montréal" },
  { value: "sao-paulo", label: "São Paulo" },
  { value: "zurich", label: "Zürich", disabled: true },
]

const sizes = [
  ["xs", "Extra small"],
  ["sm", "Small"],
  ["default", "Default"],
  ["lg", "Large"],
] as const

export default function ComboboxBoard() {
  return <>
    <div className="sys-board-row"><code>sizes</code><div>
      {sizes.map(([size, label]) => <Combobox key={size} size={size} aria-label={`${label} city search`} placeholder={label} options={cities} />)}
    </div></div>
    <div className="sys-board-row"><code>states</code><div>
      <Combobox aria-label="Selected city" options={cities} defaultValue="montreal" />
      <Combobox aria-label="Invalid city" placeholder="Choose a city" options={cities} aria-invalid />
      <Combobox aria-label="Disabled city search" placeholder="Unavailable" options={cities} disabled />
      <Combobox aria-label="Read-only city" options={cities} defaultValue="bogota" readOnly />
      <Combobox aria-label="Empty city search" placeholder="Find a city" options={[]} />
    </div></div>
  </>
}
