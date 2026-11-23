import { Ellipsis } from "lucide-react"
import { Button } from "@/registry/wlkr/button"
import { Menu } from "@/registry/wlkr/menu"

export default function MenuCustomTrigger() {
  return <Menu trigger={<Button size="icon" variant="outline" aria-label="File actions"><Ellipsis aria-hidden="true" /></Button>} items={[
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: "Duplicate" },
  ]} />
}
