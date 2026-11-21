"use client"

import * as React from "react"

/** Old gallery addresses still land somewhere useful: `/#dot-field` and root Pixels share links. */
export function LegacyLinks({ slugs }: { slugs: string[] }) {
  React.useEffect(() => {
    const { hash, search } = window.location
    if (new URLSearchParams(search).has("mask")) { window.location.replace(`/pixels${search}#pixels`); return }
    const id = hash.slice(1)
    if (id === "installation") window.location.replace("/installation")
    else if (id === "foundations") window.location.replace("/components/theme")
    else if (slugs.includes(id)) window.location.replace(`/components/${id}`)
  }, [slugs])
  return null
}
