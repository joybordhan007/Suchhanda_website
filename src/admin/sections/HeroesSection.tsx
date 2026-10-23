import { Lines } from "../../components/HeroText"
import HighlightText from "../../components/HighlightText"
import { fontStyle } from "../../content/fonts"
import type { HeroPage, HeroText } from "../../content/types"
import FontSelect from "../components/FontSelect"
import Panel from "../components/Panel"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import type { SectionProps } from "../types"

const PAGES: { id: HeroPage; label: string; path: string }[] = [
  { id: "home", label: "Home", path: "/" },
  { id: "work", label: "Work", path: "/work" },
  { id: "about", label: "About Me", path: "/about" },
  { id: "blog", label: "Blog", path: "/blog" },
  { id: "reviews", label: "Reviews", path: "/reviews" },
  { id: "contact", label: "Contact", path: "/contact" },
]

function HeroPanel({ page, hero, onChange }: { page: (typeof PAGES)[number]; hero: HeroText; onChange: (patch: Partial<HeroText>) => void }) {
  return (
    <Panel description={`Top of the ${page.label} page (${page.path}).`} title={page.label}>
      <div className="grid gap-[20px] lg:grid-cols-[1fr_260px]">
        <TextField
          hint="Put *stars* around words to show them in gold. Press Enter for a new line."
          label="Title"
          multiline
          onChange={(title) => onChange({ title })}
          rows={2}
          value={hero.title}
        />
        <FontSelect label="Title font" onChange={(titleFont) => onChange({ titleFont })} value={hero.titleFont} />
        <TextField hint="Press Enter for a new line." label="Description" multiline onChange={(description) => onChange({ description })} rows={3} value={hero.description} />
        <FontSelect label="Description font" onChange={(descriptionFont) => onChange({ descriptionFont })} value={hero.descriptionFont} />
      </div>
      {/* Preview at a smaller size; the website keeps its own text sizes. */}
      <div className="flex flex-col gap-[10px] rounded-[4px] border border-dashed border-[var(--admin-border-strong)] bg-[#fcfcfd] px-[20px] py-[18px] text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]">Preview</span>
        <p className="text-[30px] text-[#091e39]" style={fontStyle(hero.titleFont)}>
          <HighlightText text={hero.title || "Title"} />
        </p>
        <p className="text-[16px] leading-[1.4] text-[#091e39]" style={fontStyle(hero.descriptionFont)}>
          <Lines text={hero.description} />
        </p>
      </div>
    </Panel>
  )
}

// Title and description at the top of each page. Service pages are edited in Services.
export default function HeroesSection({ content, onChange, actions }: SectionProps) {
  const update = (page: HeroPage, patch: Partial<HeroText>) => onChange({ heroes: { ...content.heroes, [page]: { ...content.heroes[page], ...patch } } })
  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        actions={actions}
        description="The big title and the text under it at the top of each page. Text sizes stay as designed; you choose the words, line breaks and fonts. Service pages have their own titles in Services."
        title="Page Heroes"
      />
      {PAGES.map((page) => (
        <HeroPanel hero={content.heroes[page.id]} key={page.id} onChange={(patch) => update(page.id, patch)} page={page} />
      ))}
    </div>
  )
}
