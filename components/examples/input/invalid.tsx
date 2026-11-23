import { Input } from "@/registry/wlkr/input"

export default function InputInvalid() {
  return <Input type="email" aria-label="Email address" defaultValue="alex@" aria-invalid />
}
