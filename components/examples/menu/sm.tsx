import { Menu } from "@/registry/wlkr/menu"

export default function MenuSm() {
  return <Menu size="sm" items={[
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: "Duplicate" },
  ]} />
}
