import type { SiteContent } from "../content/types"

export type SectionProps = {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
