import { CircleArrowUp } from "lucide-react"
import { Button } from "@/registry/wlkr/button"

export default function ButtonIcon() {
  return <Button variant="outline" size="icon" aria-label="Submit"><CircleArrowUp aria-hidden="true" /></Button>
}
