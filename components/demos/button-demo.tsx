import { ArrowUp } from "lucide-react"
import { Button } from "@/registry/wlkr/button"

export function ButtonDemo() {
  return <div className="flex items-center justify-center gap-2">
    <Button variant="outline">Button</Button>
    <Button variant="outline" size="icon" aria-label="Submit"><ArrowUp aria-hidden="true" /></Button>
  </div>
}
