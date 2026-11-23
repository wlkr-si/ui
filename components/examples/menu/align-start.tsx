import { Menu } from "@/registry/wlkr/menu"

export default function MenuAlignStart() {
  return <Menu align="start" items={[
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: "Duplicate" },
  ]} />
}
