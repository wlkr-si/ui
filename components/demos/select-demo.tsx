import { Select } from "@/registry/wlkr/select"

export function SelectDemo() {
  return <div className="flex justify-center">
    <Select label="Sort" aria-label="Sort recordings" defaultValue="recent">
      <option value="recent">Most recent</option>
      <option value="name">Name</option>
      <option value="duration">Duration</option>
    </Select>
  </div>
}
