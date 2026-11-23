import { Ellipsis } from "lucide-react"
import { IconButton } from "@/registry/wlkr/icon-button"

export default function IconButtonPlain() {
  return <IconButton variant="plain" aria-label="More options"><Ellipsis aria-hidden="true" /></IconButton>
}
