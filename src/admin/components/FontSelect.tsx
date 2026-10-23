import { useId } from "react"
import { FONT_STYLES, fontStyle } from "../../content/fonts"

type FontSelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  // Offer "Design default" (value ""), which keeps the font the design uses there.
  allowDefault?: boolean
  hint?: string
}

// Font style picker; each option is shown in its own font.
export default function FontSelect({ label, value, onChange, allowDefault = true, hint }: FontSelectProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      <select className="admin-input" id={id} onChange={(event) => onChange(event.target.value)} style={fontStyle(value)} value={value}>
        {allowDefault && <option value="">Design default</option>}
        {FONT_STYLES.map((font) => (
          <option key={font.id} style={fontStyle(font.id)} value={font.id}>
            {font.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-[13px] leading-[1.45] text-[var(--admin-muted)]">{hint}</p>}
    </div>
  )
}
