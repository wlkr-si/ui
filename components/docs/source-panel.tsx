"use client"

import { Code2 } from "lucide-react"
import { CodePanel, type CodePanelProps } from "@/components/code-panel"
import { Disclosure } from "@/components/disclosure"

/** The full source, closed until asked for. */
export function SourcePanel(props: CodePanelProps) {
  return <Disclosure title="View source" icon={Code2}><CodePanel {...props} /></Disclosure>
}
