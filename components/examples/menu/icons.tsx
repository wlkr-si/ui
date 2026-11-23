import { Copy, Pencil } from "lucide-react"
import { Menu } from "@/registry/wlkr/menu"

export default function MenuIcons() {
  return <Menu items={[
    { id: "rename", label: "Rename", icon: <Pencil /> },
    { id: "duplicate", label: "Duplicate", icon: <Copy /> },
  ]} />
}
