import { Plus } from "lucide-react"
import { Button, type ButtonVariant } from "@/registry/wlkr/button"

const sizes = [["xs", "icon-xs"], ["sm", "icon-sm"], ["default", "icon"], ["lg", "icon-lg"]] as const
const variants: ButtonVariant[] = ["default", "secondary", "outline", "ghost", "destructive", "link"]

/** Every Button variant at every size, plus its states, for the System page. */
export default function ButtonBoard() {
  return <>
    {variants.map(variant => <div key={variant} className="sys-board-row">
      <code>{variant}</code>
      <div>{sizes.map(([size, icon]) => <span key={size} className="sys-board-pair">
        <Button variant={variant} size={size}>{variant === "destructive" ? "Delete" : "Button"}</Button>
        {variant !== "link" && <Button variant={variant} size={icon} aria-label="Add"><Plus aria-hidden="true" /></Button>}
      </span>)}</div>
    </div>)}
    <div className="sys-board-row"><code>states</code><div>
      <Button variant="outline" aria-pressed>Pressed</Button>
      <Button loading>Saving</Button>
      <Button disabled>Disabled</Button>
      <Button glow>Glow</Button>
    </div></div>
  </>
}
