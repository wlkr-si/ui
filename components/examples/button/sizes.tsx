import { ArrowUpRight } from "lucide-react"
import { Button } from "@/registry/wlkr/button"

export default function ButtonSizes() {
  return <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
    <div className="flex items-center gap-2">
      <Button variant="outline" size="xs">Extra small</Button>
      <Button variant="outline" size="icon-xs" aria-label="Open"><ArrowUpRight aria-hidden="true" /></Button>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">Small</Button>
      <Button variant="outline" size="icon-sm" aria-label="Open"><ArrowUpRight aria-hidden="true" /></Button>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline">Default</Button>
      <Button variant="outline" size="icon" aria-label="Open"><ArrowUpRight aria-hidden="true" /></Button>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="lg">Large</Button>
      <Button variant="outline" size="icon-lg" aria-label="Open"><ArrowUpRight aria-hidden="true" /></Button>
    </div>
  </div>
}
