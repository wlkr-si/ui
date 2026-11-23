import { Menu } from "@/registry/wlkr/menu"

export default function MenuDefault() {
  return <Menu items={[
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: "Duplicate" },
  ]} />
}
