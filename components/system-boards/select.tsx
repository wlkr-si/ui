import { Select, type SelectSize } from "@/registry/wlkr/select"

const sizes: SelectSize[] = ["xs", "sm", "default", "lg"]

export default function SelectBoard() {
  return <>
    <div className="sys-board-row"><code>sizes</code><div>
      {sizes.map(size => <Select key={size} size={size} aria-label={`Select size ${size}`} defaultValue={size}>
        {sizes.map(option => <option key={option}>{option}</option>)}
      </Select>)}
    </div></div>
    <div className="sys-board-row"><code>states</code><div>
      <Select label="Sort"><option>Recent</option><option>Name</option></Select>
      <Select aria-label="Invalid select" aria-invalid><option>Invalid</option></Select>
      <Select aria-label="Disabled select" disabled><option>Disabled</option></Select>
    </div></div>
  </>
}
