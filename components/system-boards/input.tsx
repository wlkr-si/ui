import { Search } from "lucide-react"
import { Button } from "@/registry/wlkr/button"
import { Input } from "@/registry/wlkr/input"

const sizes = ["xs", "sm", "default", "lg"] as const

export default function InputBoard() {
  return <>
    {sizes.map(size => <div key={size} className="sys-board-row">
      <code>{size}</code>
      <div style={{ columnGap: "var(--wlkr-space-3)" }}>
        <span className="sys-board-pair">
          <Input size={size} className="w-28" aria-label="Track title" placeholder="Track title" />
          <Button size={size} variant="outline">Save</Button>
        </span>
        <Input size={size} className="w-28" aria-label="Search tracks" placeholder="Search" icon={<Search />} />
        <Input size={size} className="w-28" aria-label="Filter tracks" defaultValue="Piano" clearable />
        <Input size={size} className="w-28" aria-label="Search artists" defaultValue="Jazz" icon={<Search />} clearable />
      </div>
    </div>)}
    <div className="sys-board-row">
      <code>states</code>
      <div>
        <Input className="w-28" aria-label="Focus example" placeholder="Focus me" />
        <Input className="w-28" aria-label="Email address" defaultValue="alex@" aria-invalid />
        <Input className="w-28" aria-label="Unavailable field" placeholder="Disabled" disabled />
        <Input className="w-28" aria-label="Read-only field" defaultValue="Read-only" readOnly />
      </div>
    </div>
  </>
}
