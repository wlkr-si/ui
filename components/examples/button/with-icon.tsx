import { GitBranch } from "lucide-react"
import { Button } from "@/registry/wlkr/button"

export default function ButtonWithIcon() {
  return <Button variant="outline"><GitBranch aria-hidden="true" />New branch</Button>
}
