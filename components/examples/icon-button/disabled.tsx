import { SkipForward } from "lucide-react"
import { IconButton } from "@/registry/wlkr/icon-button"

export default function IconButtonDisabled() {
  return <IconButton variant="outline" disabled aria-label="Next track"><SkipForward aria-hidden="true" /></IconButton>
}
