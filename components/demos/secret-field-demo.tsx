"use client"

import { SecretField } from "@/registry/wlkr/secret-field"

export function SecretFieldDemo() {
  return (
    <div className="flex w-full max-w-[420px] flex-col items-stretch gap-5">
      <SecretField label="Publishable key" value="pk_live_51WLKR8sT2nQmVx4f2a" visibleEnd={4} />
      <SecretField label="Secret key" value="sk_test_wlkr_0000_example_do_not_use_9c1e" revealFor={6000} />
    </div>
  )
}
