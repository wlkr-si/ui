import { Combobox } from "@/registry/wlkr/combobox"

export default function ComboboxEmpty() {
  return <Combobox aria-label="City" placeholder="Find a city" options={[]} emptyMessage="No cities found" />
}
