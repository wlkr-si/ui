import { Archive, Ellipsis, Pencil } from "lucide-react"
import { Button } from "@/registry/wlkr/button"
import { Menu, type MenuItem } from "@/registry/wlkr/menu"

const sizes = ["xs", "sm", "default", "lg"] as const
const alignments = ["end", "start"] as const
const items = [
  { id: "rename", label: "Rename" },
  { id: "duplicate", label: "Duplicate" },
] satisfies MenuItem[]

export default function MenuBoard() {
  return <>
    {alignments.map(align => <div key={align} className="sys-board-row">
      <code>{align}</code>
      <div>{sizes.map(size => <Menu key={size} align={align} size={size} items={items} />)}</div>
    </div>)}
    <div className="sys-board-row">
      <code>states</code>
      <div>
        <Menu align="start" trigger={<Button variant="outline">File actions</Button>} items={[
          { id: "rename", label: "Rename", icon: <Pencil /> },
          { id: "divider", type: "separator" },
          { id: "archive", label: "Archive", icon: <Archive />, disabled: true },
        ]} />
        <Menu align="start" trigger={<Button size="icon" variant="outline" aria-label="More file actions"><Ellipsis aria-hidden="true" /></Button>} items={items} />
      </div>
    </div>
  </>
}
