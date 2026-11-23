import { Play } from "lucide-react"
import { IconButton } from "@/registry/wlkr/icon-button"

export default function IconButtonDefaultSize() {
  return <IconButton variant="outline" size="default" aria-label="Play"><Play aria-hidden="true" /></IconButton>
}
