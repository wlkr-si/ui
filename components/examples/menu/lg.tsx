import { Menu } from "@/registry/wlkr/menu"

export default function MenuLg() {
  return <Menu size="lg" items={[
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: "Duplicate" },
  ]} />
}
