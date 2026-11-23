import { Button } from "@/registry/wlkr/button"
import { Segmented } from "@/registry/wlkr/segmented"
import { Select } from "@/registry/wlkr/select"

const sizes = ["sm", "default"] as const
const options = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
]
const twoOptions = options.slice(0, 2)
const optionsWithDisabled = [
  options[0],
  { ...options[1], disabled: true },
  options[2],
]

export default function SegmentedBoard() {
  return <>
    {sizes.map(size => <div key={size} className="sys-board-row">
      <code>{size}</code>
      <div>
        <Segmented size={size} label="View" options={options} defaultValue="week" />
        <Button size={size} variant="outline">Today</Button>
        <Select size={size === "sm" ? "sm" : undefined} aria-label="Time zone">
          <option>Local time</option>
          <option>UTC</option>
        </Select>
      </div>
    </div>)}
    <div className="sys-board-row">
      <code>states</code>
      <div>
        <Segmented aria-label="View" options={twoOptions} defaultValue="week" />
        <Segmented label="View" options={optionsWithDisabled} />
        <Segmented label="View" options={twoOptions} defaultValue="week" disabled />
      </div>
    </div>
  </>
}
