import type { ItemFonts } from "../../content/types"
import FontSelect from "./FontSelect"

type ItemFontsFieldsProps = {
  value: ItemFonts | undefined
  onChange: (fonts: ItemFonts) => void
  headingHint?: string
  textHint?: string
}

// The two font choices every service, work item and post has: headings and other text.
export default function ItemFontsFields({ value, onChange, headingHint, textHint }: ItemFontsFieldsProps) {
  const fonts = value ?? { heading: "", text: "" }
  return (
    <div className="grid gap-[16px] md:grid-cols-2">
      <FontSelect hint={headingHint} label="Heading font" onChange={(heading) => onChange({ ...fonts, heading })} value={fonts.heading} />
      <FontSelect hint={textHint} label="Text font" onChange={(text) => onChange({ ...fonts, text })} value={fonts.text} />
    </div>
  )
}
