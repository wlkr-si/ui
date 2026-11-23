import { Play, Repeat, SkipForward } from "lucide-react"
import { IconButton } from "@/registry/wlkr/icon-button"

const sizes = ["xs", "sm", "default", "lg"] as const
const variants = ["glass", "plain", "outline"] as const

export default function IconButtonBoard() {
  return <>
    {variants.map(variant => <div key={variant} className="sys-board-row">
      <code>{variant}</code>
      <div>{sizes.map(size => <IconButton key={size} variant={variant} size={size} aria-label="Play">
        <Play aria-hidden="true" />
      </IconButton>)}</div>
    </div>)}
    <div className="sys-board-row">
      <code>states</code>
      <div>
        <IconButton variant="outline" aria-label="Repeat" aria-pressed={false}><Repeat aria-hidden="true" /></IconButton>
        <IconButton variant="outline" aria-label="Repeat" aria-pressed><Repeat aria-hidden="true" /></IconButton>
        <IconButton variant="outline" aria-label="Next track" disabled><SkipForward aria-hidden="true" /></IconButton>
      </div>
    </div>
  </>
}
