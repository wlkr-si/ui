import { Menu } from "@/registry/wlkr/menu"

export default function MenuSeparator() {
  return <Menu items={[
    { id: "rename", label: "Rename" },
    { id: "divider", type: "separator" },
    { id: "archive", label: "Archive" },
  ]} />
}
