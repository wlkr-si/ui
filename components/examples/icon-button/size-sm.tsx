import { Play } from "lucide-react"
import { IconButton } from "@/registry/wlkr/icon-button"

export default function IconButtonSmall() {
  return <IconButton variant="outline" size="sm" aria-label="Play"><Play aria-hidden="true" /></IconButton>
}
