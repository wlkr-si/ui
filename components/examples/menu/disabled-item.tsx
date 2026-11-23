import { Menu } from "@/registry/wlkr/menu"

export default function MenuDisabledItem() {
  return <Menu items={[
    { id: "rename", label: "Rename" },
    { id: "archive", label: "Archive", disabled: true },
  ]} />
}
