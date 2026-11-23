import { Select } from "@/registry/wlkr/select"

export function SelectDemo() {
  return <div className="flex flex-wrap items-center justify-center gap-4">
    <Select label="Sort" aria-label="Sort recordings" defaultValue="recent"><option value="recent">Recent</option><option value="name">Name</option><option value="duration">Duration</option></Select>
    <Select size="sm" label="Y" aria-label="Year" defaultValue="2026"><option>2026</option><option>2025</option><option>2024</option></Select>
    <Select disabled aria-label="Unavailable sort"><option>Recent</option></Select>
  </div>
}
