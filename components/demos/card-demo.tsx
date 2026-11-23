import { Card, CardCaption, CardContent, CardFooter, CardHeader, CardTitle } from "@/registry/wlkr/card"

export function CardDemo() {
  return (
    <Card>
      <CardHeader><CardTitle>Goldberg Variations</CardTitle></CardHeader>
      <CardContent>Johann Sebastian Bach</CardContent>
      <CardFooter><CardCaption>Recorded in Leipzig, 2026</CardCaption></CardFooter>
    </Card>
  )
}
