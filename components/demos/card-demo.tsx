import { MoreHorizontal } from "lucide-react"
import { Card, CardHeader, CardTitle, CardTools, CardContent, CardFooter, CardCaption } from "@/registry/wlkr/card"
import { IconButton } from "@/registry/wlkr/icon-button"

export function CardDemo() {
  return <Card>
    <CardHeader><CardTitle>Recordings</CardTitle><CardTools><IconButton size="sm" variant="plain" aria-label="Recording options"><MoreHorizontal aria-hidden="true" /></IconButton></CardTools></CardHeader>
    <CardContent><div className="flex items-baseline justify-between gap-4 py-5"><span>Goldberg Variations</span><span className="font-mono text-xs text-muted-foreground">51:32</span></div></CardContent>
    <CardFooter><CardCaption>Recorded in Leipzig, 2026.</CardCaption></CardFooter>
  </Card>
}
