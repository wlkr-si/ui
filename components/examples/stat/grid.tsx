import { Stat, Stats } from "@/registry/wlkr/stat"

export default function StatsGrid() {
  return (
    <Stats>
      <Stat label="Recordings" value={128} />
      <Stat label="Hours" value={42} />
      <Stat label="Composers" value={24} />
      <Stat label="Saved" value={96} />
    </Stats>
  )
}
