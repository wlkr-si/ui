"use client"

import { FooterControls } from "@/registry/wlkr/footer-controls"

export function FooterControlsDemo() {
  return <div className="flex justify-center">
    <FooterControls agentHref="/llms.txt" />
  </div>
}
