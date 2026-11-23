import { Search } from "lucide-react"
import { Input } from "@/registry/wlkr/input"

export default function InputWithIcon() {
  return <Input aria-label="Search artists" placeholder="Search artists" icon={<Search />} />
}
