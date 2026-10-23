import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react"
import { FONT_STYLES, fontLabel, fontStyle, googleFontId, googleFontsHref, loadGoogleFonts, parseGoogleFont, styleName } from "../../content/fonts"
import { GOOGLE_FONTS } from "../googleFonts"
import Icon from "./Icon"

type FontSelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  // Offer "Design default" (value ""), which keeps the font the design uses there.
  allowDefault?: boolean
  hint?: string
}

const SHOWN = 60
const categoryNames: Record<string, string> = { s: "Sans serif", f: "Serif", d: "Display", h: "Handwriting", m: "Monospace" }

// The style a newly picked Google font starts with: the closest to the current weight.
function defaultStyle(styles: string[], current: string) {
  const want = parseGoogleFont(current)?.weight ?? FONT_STYLES.find((font) => font.id === current)?.weight ?? 400
  const upright = styles.filter((style) => !style.endsWith("i"))
  const pool = upright.length ? upright : styles
  return pool.reduce((best, style) => (Math.abs(parseInt(style) - want) < Math.abs(parseInt(best) - want) ? style : best), pool[0])
}

// Preview fonts in the open list, downloading only the letters of each family name.
function usePreviews(families: (readonly [string, string, string])[]) {
  useEffect(() => {
    if (families.length === 0) return
    const ids = families.map(([family, category, styles]) => googleFontId(category, family, defaultStyle(styles.split(","), "")))
    const letters = [...new Set(families.map(([family]) => family).join(""))].join("")
    loadGoogleFonts("picker", googleFontsHref(ids, letters))
  }, [families])
}

// Font picker: Design default, the website's own fonts and every Google Font (A–Z), with
// search. Google fonts also get a style (weight / italic) choice.
export default function FontSelect({ label, value, onChange, allowDefault = true, hint }: FontSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const box = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const google = parseGoogleFont(value)
  const family = google ? GOOGLE_FONTS.find(([name]) => name === google.family) : undefined

  // The chosen Google font itself, so the button shows it in its own font.
  useEffect(() => loadGoogleFonts(`select-${id}`, googleFontsHref(value ? [value] : [])), [id, value])

  useEffect(() => {
    if (!open) return
    search.current?.focus()
    const close = (event: MouseEvent) => !box.current?.contains(event.target as Node) && setOpen(false)
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", escape)
    }
  }, [open])

  const term = query.trim().toLowerCase()
  const siteFonts = FONT_STYLES.filter((font) => !term || font.label.toLowerCase().includes(term))
  const matches = useMemo(() => GOOGLE_FONTS.filter(([name]) => !term || name.toLowerCase().includes(term)), [term])
  const shown = useMemo(() => (open ? matches.slice(0, SHOWN) : []), [open, matches])
  usePreviews(shown)

  const pick = (next: string) => {
    onChange(next)
    setOpen(false)
    setQuery("")
  }

  const row = (key: string, text: string, style: CSSProperties, selected: boolean, onPick: () => void, note?: string) => (
    <li key={key}>
      <button
        aria-selected={selected}
        className={`flex w-full items-center justify-between gap-[12px] rounded-[4px] px-[10px] py-[7px] text-left text-[15px] transition ${
          selected ? "bg-[#fdf6e9] text-[var(--admin-text)]" : "text-[var(--admin-text)] hover:bg-[#f2f4f7]"
        }`}
        onClick={onPick}
        role="option"
        type="button"
      >
        <span className="truncate" style={style}>
          {text}
        </span>
        <span className="flex shrink-0 items-center gap-[6px] text-[11px] text-[var(--admin-muted)]">
          {note}
          {selected && <Icon className="text-[var(--admin-gold-ink)]" name="check" size={14} />}
        </span>
      </button>
    </li>
  )

  return (
    <div className="flex flex-col gap-[6px]">
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      <div className="relative" ref={box}>
        <button
          aria-expanded={open}
          aria-haspopup="listbox"
          className="admin-input flex items-center justify-between gap-[8px] text-left"
          id={id}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span className="truncate" style={fontStyle(value)}>
            {fontLabel(value)}
          </span>
          <Icon className="shrink-0 rotate-[-90deg] text-[var(--admin-muted)]" name="back" size={14} />
        </button>
        {open && (
          <div className="absolute top-[calc(100%+6px)] right-0 z-40 w-[max(100%,320px)] overflow-hidden rounded-[4px] border border-[var(--admin-border-strong)] bg-white shadow-[0_16px_40px_rgb(16_24_40/18%)]">
            <div className="border-b border-[var(--admin-border)] p-[8px]">
              <input
                aria-label="Search fonts"
                className="admin-input h-[38px] py-0 text-[14px]"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return
                  event.preventDefault()
                  const first = siteFonts[0]?.id ?? (shown[0] && googleFontId(shown[0][1], shown[0][0], defaultStyle(shown[0][2].split(","), value)))
                  if (first) pick(first)
                }}
                placeholder={`Search ${GOOGLE_FONTS.length + FONT_STYLES.length} fonts…`}
                ref={search}
                value={query}
              />
            </div>
            <ul className="max-h-[320px] overflow-y-auto p-[6px]" role="listbox">
              {allowDefault && !term && row("default", "Design default", {}, value === "", () => pick(""), "keeps the design's font")}
              {siteFonts.length > 0 && <li className="px-[10px] pt-[8px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--admin-muted)]">Website fonts</li>}
              {siteFonts.map((font) => row(font.id, font.label, fontStyle(font.id), value === font.id, () => pick(font.id)))}
              {shown.length > 0 && (
                <li className="px-[10px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--admin-muted)]">
                  Google Fonts · A–Z ({matches.length})
                </li>
              )}
              {shown.map(([name, category, styles]) => {
                const style = defaultStyle(styles.split(","), value)
                return row(
                  name,
                  name,
                  { fontFamily: `"${name}", sans-serif` },
                  google?.family === name,
                  () => pick(googleFontId(category, name, google?.family === name ? `${google.weight}${google.italic ? "i" : ""}` : style)),
                  categoryNames[category],
                )
              })}
              {matches.length > SHOWN && (
                <li className="px-[10px] py-[8px] text-[12px] text-[var(--admin-muted)]">
                  Showing {SHOWN} of {matches.length} — type a name to find the rest.
                </li>
              )}
              {siteFonts.length === 0 && matches.length === 0 && <li className="px-[10px] py-[12px] text-[13px] text-[var(--admin-muted)]">No font matches “{query}”.</li>}
            </ul>
          </div>
        )}
      </div>
      {google && family && (
        <select
          aria-label={`${label} style`}
          className="admin-input h-[38px] py-0 text-[14px]"
          onChange={(event) => onChange(googleFontId(google.category, google.family, event.target.value))}
          value={`${google.weight}${google.italic ? "i" : ""}`}
        >
          {family[2].split(",").map((style) => (
            <option key={style} value={style}>
              {styleName(style)}
            </option>
          ))}
        </select>
      )}
      {hint && <p className="text-[13px] leading-[1.45] text-[var(--admin-muted)]">{hint}</p>}
    </div>
  )
}
