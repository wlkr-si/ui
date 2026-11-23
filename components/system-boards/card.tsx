import CardContentOnly from "@/components/examples/card/content"
import CardWithCaption from "@/components/examples/card/with-caption"
import CardWithTools from "@/components/examples/card/with-tools"

export default function CardBoard() {
  return <>
    <div className="sys-board-row"><code>content</code><div><CardContentOnly /></div></div>
    <div className="sys-board-row"><code>with tools</code><div><CardWithTools /></div></div>
    <div className="sys-board-row"><code>with caption</code><div><CardWithCaption /></div></div>
  </>
}
