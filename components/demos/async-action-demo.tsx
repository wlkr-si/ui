"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { AsyncAction } from "@/registry/wlkr/async-action"

export function AsyncActionDemo() {
  const [failure, setFailure] = React.useState(false)
  return (
    <div>
      <div className="demo-actions">
        <AsyncAction
          action={async () => { await new Promise(resolve => setTimeout(resolve, 1100)); if (failure) throw new Error("Demo failure") }}
          pendingLabel="Saving changes…"
          successLabel="Changes saved"
          errorLabel="Changes weren’t saved. Turn off the error simulation and try again."
        >
          Save changes
        </AsyncAction>
      </div>
      <label className="demo-option"><Switch checked={failure} onCheckedChange={setFailure} aria-label="Simulate a failed save" />Simulate a failed save</label>
    </div>
  )
}
