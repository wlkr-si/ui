import Link from "next/link"
import { Button } from "@/registry/wlkr/button"

export default function ButtonAsChild() {
  return <Button asChild variant="outline"><Link href="/components">Browse components</Link></Button>
}
