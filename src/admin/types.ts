import type { SiteContent } from "../content/types"

// Sections edited as a whole and saved with the shared "Save changes" bar.
export type SectionProps = {
  content: SiteContent
  onChange: (patch: Partial<SiteContent>) => void
  // For parts of a section that save on their own (e.g. Tracking in Site Settings).
  commit?: (apply: (content: SiteContent) => SiteContent) => Promise<void>
}

// Sections that list items (services, work, blog). Each change is saved straight
// away with `commit`, which applies the same change to the saved content.
export type ManagedSectionProps = {
  content: SiteContent
  commit: (apply: (content: SiteContent) => SiteContent) => Promise<void>
  itemId?: string
  open: (section: string, itemId?: string) => void
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
