import { Stat, Stats } from "@/registry/wlkr/stat"

export function StatDemo() {
  return <Stats>
    <Stat label="Recordings" value="128" note="This year" />
    <Stat label="Listening" value="42h" note="Last 30 days" />
    <Stat label="Composers" value="24" />
    <Stat label="Saved" value="96" note="Across 8 lists" />
  </Stats>
}
