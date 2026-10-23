import { useState } from "react"
import { TEXT_GROUPS, type TextDef, type TextKey } from "../../content/siteText"
import FontSelect from "../components/FontSelect"
import Panel from "../components/Panel"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import type { SectionProps } from "../types"

type GroupId = keyof typeof TEXT_GROUPS

const groupIds = Object.keys(TEXT_GROUPS) as GroupId[]

function TextRow({
  def,
  text,
  font,
  changed,
  onChange,
  onReset,
}: {
  def: TextDef
  text: string
  font: string
  changed: boolean
  onChange: (patch: { text?: string; font?: string }) => void
  onReset: () => void
}) {
  const long = def.text.length > 70 || def.text.includes("\n")
  return (
    <div className="grid gap-[12px] border-t border-[var(--admin-border)] pt-[18px] first:border-t-0 first:pt-0 lg:grid-cols-[1fr_240px]">
      {def.fontOnly ? (
        <div className="flex flex-col gap-[4px]">
          <span className="admin-label">{def.label}</span>
          <p className="text-[13px] text-[var(--admin-muted)]">The words come from elsewhere in the dashboard; choose the font here.</p>
        </div>
      ) : (
        <TextField label={def.label} multiline={long} onChange={(value) => onChange({ text: value })} rows={def.text.length > 400 ? 14 : long ? 3 : undefined} value={text} />
      )}
      <div className="flex flex-col gap-[8px]">
        <FontSelect label="Font" onChange={(value) => onChange({ font: value })} value={font} />
        {changed && (
          <button className="self-start text-[12px] font-semibold text-[var(--admin-gold-ink)] hover:underline" onClick={onReset} type="button">
            Back to the original
          </button>
        )}
      </div>
    </div>
  )
}

// Every fixed text on the website, grouped by page, with a font choice for each.
export default function SiteTextSection({ content, onChange, actions }: SectionProps) {
  const [group, setGroup] = useState<GroupId>("home")
  const { texts } = content
  const items = TEXT_GROUPS[group].items as Record<string, TextDef>

  const update = (key: TextKey, patch: { text?: string; font?: string }) => {
    const next = { ...texts[key], ...patch }
    const def = items[key.split(".")[1]]
    // Keep only real changes, so later updates to the defaults still come through.
    if (next.text === def.text) delete next.text
    if (!next.font) delete next.font
    const all = { ...texts }
    if (next.text === undefined && next.font === undefined) delete all[key]
    else all[key] = next
    onChange({ texts: all })
  }

  const reset = (key: TextKey) => {
    const all = { ...texts }
    delete all[key]
    onChange({ texts: all })
  }

  const changedIn = (id: GroupId) => Object.keys(texts).filter((key) => key.startsWith(`${id}.`)).length

  return (
    <div className="flex flex-col gap-[24px]">
      <SectionHeader
        actions={actions}
        description="All the fixed words on the website — menu, buttons, section headings, the dark banner, the contact form, footer and legal pages — and the font of each. Put *stars* around words to show them in gold; {name} shows your name. Text sizes stay as designed."
        title="Site Text"
      />
      <div className="flex flex-wrap gap-[8px]">
        {groupIds.map((id) => (
          <button
            className={`flex h-[34px] items-center gap-[8px] rounded-[4px] border px-[14px] text-[13px] font-semibold transition ${
              group === id ? "border-[var(--admin-navy)] bg-[var(--admin-navy)] text-white" : "border-[var(--admin-border)] bg-white text-[var(--admin-text-2)] hover:border-[var(--admin-gold)]"
            }`}
            key={id}
            onClick={() => setGroup(id)}
            type="button"
          >
            {TEXT_GROUPS[id].label}
            {changedIn(id) > 0 && (
              <span className={`rounded-[4px] px-[6px] text-[11px] ${group === id ? "bg-white/15" : "bg-[#fdf6e9] text-[var(--admin-gold-ink)]"}`} title="Changed texts">
                {changedIn(id)}
              </span>
            )}
          </button>
        ))}
      </div>
      <Panel title={TEXT_GROUPS[group].label}>
        <div className="flex flex-col gap-[18px]">
          {Object.entries(items).map(([item, def]) => {
            const key = `${group}.${item}` as TextKey
            return (
              <TextRow
                changed={texts[key] !== undefined}
                def={def}
                font={texts[key]?.font ?? ""}
                key={key}
                onChange={(patch) => update(key, patch)}
                onReset={() => reset(key)}
                text={texts[key]?.text ?? def.text}
              />
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
