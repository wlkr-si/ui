import { Card, CardCaption, CardContent, CardFooter, CardHeader, CardTitle } from "@/registry/wlkr/card"

export default function CardWithCaption() {
  return (
    <Card>
      <CardHeader><CardTitle>Cello Suite No. 1</CardTitle></CardHeader>
      <CardContent>Johann Sebastian Bach</CardContent>
      <CardFooter><CardCaption>Recorded in Berlin, 2025</CardCaption></CardFooter>
    </Card>
  )
}
