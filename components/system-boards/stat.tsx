import StatDefault from "@/components/examples/stat/default"
import StatsGrid from "@/components/examples/stat/grid"
import StatWithNote from "@/components/examples/stat/with-note"

export default function StatBoard() {
  return <>
    <div className="sys-board-row"><code>single metric</code><div><StatDefault /></div></div>
    <div className="sys-board-row"><code>with a note</code><div><StatWithNote /></div></div>
    <div className="sys-board-row"><code>grid</code><div><StatsGrid /></div></div>
  </>
}
