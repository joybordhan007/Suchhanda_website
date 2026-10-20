import ListEditor from "../components/ListEditor"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import type { SectionProps } from "../types"

export default function StatsSection({ content, onChange }: SectionProps) {
  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        description="The four animated numbers shown on the Home, Work and About Me pages. The design has room for exactly four."
        title="Achievements"
      />
      <ListEditor
        itemTitle={(stat) => `${stat.value}${stat.suffix} — ${stat.label}`}
        items={content.stats}
        onChange={(stats) => onChange({ stats })}
        openByDefault
        renderItem={(stat, update) => (
          <div className="grid gap-[16px] md:grid-cols-3">
            <TextField
              label="Number"
              onChange={(value) => update({ value: Number(value) || 0 })}
              type="number"
              value={String(stat.value)}
            />
            <TextField
              hint='For example "+" or "%"'
              label="Suffix"
              onChange={(suffix) => update({ suffix })}
              value={stat.suffix}
            />
            <TextField label="Label" onChange={(label) => update({ label })} value={stat.label} />
          </div>
        )}
      />
    </div>
  )
}
