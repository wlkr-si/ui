import Link from "next/link"
import { Button } from "@/registry/wlkr/button"
import { Card, CardContent, CardHeader, CardTitle, CardTools } from "@/registry/wlkr/card"

export default function CardWithTools() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listening activity</CardTitle>
        <CardTools>
          <Button asChild variant="outline">
            <Link href="/components/stat">View stats</Link>
          </Button>
        </CardTools>
      </CardHeader>
      <CardContent>42 hours listened this month.</CardContent>
    </Card>
  )
}
