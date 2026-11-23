import { Menu } from "@/registry/wlkr/menu"

export default function MenuXs() {
  return <Menu size="xs" items={[
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: "Duplicate" },
  ]} />
}
