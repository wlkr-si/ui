"use client"

import { Crumbs, type CrumbItem, type CrumbLinkProps } from "@/registry/wlkr/crumbs"

const deep: CrumbItem[] = [
  { label: "wlkr", href: "/" },
  { label: "studio", href: "/studio" },
  { label: "projects", href: "/studio/projects" },
  { label: "pixels", href: "/studio/projects/pixels" },
  { label: "src", href: "/studio/projects/pixels/src" },
  { label: "dither.ts" },
]

const short: CrumbItem[] = [
  { label: "docs", href: "/docs" },
  { label: "components", href: "/docs/components" },
  { label: "crumbs" },
]

const link = (_item: CrumbItem, props: CrumbLinkProps) => <a {...props} onClick={e => e.preventDefault()} />

export function CrumbsDemo() {
  return (
    <div className="flex w-full flex-col items-start gap-6">
      <Crumbs items={deep} renderLink={link} />
      <Crumbs items={short} renderLink={link} />
    </div>
  )
}
