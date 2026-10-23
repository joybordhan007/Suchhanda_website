import { fontStyle } from "../content/fonts"
import { textDef, type TextKey } from "../content/siteText"
import { useSiteContent } from "../content/store"
import HighlightText from "./HighlightText"

// Text and font for a fixed piece of website text: the dashboard's change, or the default.
export function useSiteText() {
  const { texts, settings } = useSiteContent()
  return (key: TextKey) => {
    const saved = texts[key]
    const text = (saved?.text ?? textDef(key).text).replace(/\{name\}/g, settings.ownerName).replace(/\{year\}/g, String(new Date().getFullYear()))
    return { text, style: fontStyle(saved?.font) }
  }
}

// Renders a fixed piece of website text with its chosen font. `className` is the line
// height for each line (the design's text boxes often have line-height 0 themselves).
export default function Txt({ k, className = "leading-[1.2]" }: { k: TextKey; className?: string }) {
  const { text, style } = useSiteText()(k)
  return (
    <span style={style}>
      <HighlightText className={className} text={text} />
    </span>
  )
}
