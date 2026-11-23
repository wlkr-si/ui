import { Stat } from "@/registry/wlkr/stat"

export function StatDemo() {
  return <Stat label="Recordings" value={128} note="This year" style={{ width: "fit-content" }} />
}
