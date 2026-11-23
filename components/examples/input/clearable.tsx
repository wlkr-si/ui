import { Input } from "@/registry/wlkr/input"

export default function InputClearable() {
  return <Input aria-label="Filter tracks" placeholder="Filter tracks" defaultValue="Acoustic" clearable clearLabel="Clear track filter" />
}
