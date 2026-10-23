import type { CSSProperties } from "react"

// Fonts a text can use, stored as a font id:
// - "" keeps the font the design uses at that spot ("Design default");
// - one of FONT_STYLES: the faces the website already loads (see the @font-face rules at
//   the top of index.css);
// - "g:<category>:<Family>:<style>" for any Google Fonts family, e.g. "g:f:Lora:700i"
//   (category s sans-serif, f serif, d display, h handwriting, m monospace; style is the
//   weight, with "i" for italic). These are loaded from Google Fonts only when used.
export const FONT_STYLES = [
  { id: "noto-serif-bold", label: "Noto Serif · Bold", family: "Noto Serif:Bold", weight: 700 },
  { id: "noto-serif-semibold", label: "Noto Serif · SemiBold", family: "Noto Serif:SemiBold", weight: 600 },
  { id: "noto-serif-medium", label: "Noto Serif · Medium", family: "Noto Serif:Medium", weight: 500 },
  { id: "noto-sans-bold", label: "Noto Sans · Bold", family: "Noto Sans:Bold", weight: 700 },
  { id: "noto-sans-regular", label: "Noto Sans · Regular", family: "Noto Sans:Regular", weight: 400 },
  { id: "inter-bold", label: "Inter · Bold", family: "Inter:Bold", weight: 700 },
  { id: "inter-semibold", label: "Inter · SemiBold", family: "Inter:Semi Bold", weight: 600 },
  { id: "inter-medium", label: "Inter · Medium", family: "Inter:Medium", weight: 500 },
  { id: "inter-regular", label: "Inter · Regular", family: "Inter:Regular", weight: 400 },
  { id: "inter-italic", label: "Inter · Italic", family: "Inter:Italic", weight: 400, italic: true },
  { id: "anuphan-medium", label: "Anuphan · Medium", family: "Anuphan:Medium", weight: 500 },
  { id: "anuphan-regular", label: "Anuphan · Regular", family: "Anuphan:Regular", weight: 400 },
  { id: "nunito-sans-semibold", label: "Nunito Sans · SemiBold", family: "Nunito Sans:SemiBold", weight: 600 },
] as const satisfies readonly { id: string; label: string; family: string; weight: number; italic?: boolean }[]

const fallbacks: Record<string, string> = { s: "sans-serif", f: "serif", d: "sans-serif", h: "cursive", m: "monospace" }

const weightNames: Record<string, string> = {
  "100": "Thin",
  "200": "ExtraLight",
  "300": "Light",
  "400": "Regular",
  "500": "Medium",
  "600": "SemiBold",
  "700": "Bold",
  "800": "ExtraBold",
  "900": "Black",
}

export type GoogleFont = { category: string; family: string; weight: number; italic: boolean }

export function googleFontId(category: string, family: string, style: string) {
  return `g:${category}:${family}:${style}`
}

export function parseGoogleFont(id: string | undefined): GoogleFont | null {
  const match = id?.match(/^g:([a-z]):([^:]+):(\d{3})(i?)$/)
  return match ? { category: match[1], family: match[2], weight: Number(match[3]), italic: match[4] === "i" } : null
}

// "700i" -> "Bold Italic"
export function styleName(style: string) {
  const name = weightNames[style.slice(0, 3)] ?? style.slice(0, 3)
  return style.endsWith("i") ? (name === "Regular" ? "Italic" : `${name} Italic`) : name
}

export function fontLabel(id: string | undefined) {
  if (!id) return "Design default"
  const google = parseGoogleFont(id)
  if (google) return `${google.family} · ${styleName(`${google.weight}${google.italic ? "i" : ""}`)}`
  return FONT_STYLES.find((font) => font.id === id)?.label ?? "Design default"
}

// Inline style for a font id; "" or an unknown id leaves the design's own font in place.
export function fontStyle(id: string | undefined): CSSProperties {
  const google = parseGoogleFont(id)
  if (google) {
    return {
      fontFamily: `"${google.family}", ${fallbacks[google.category] ?? "sans-serif"}`,
      fontWeight: google.weight,
      fontStyle: google.italic ? "italic" : "normal",
    }
  }
  const font = FONT_STYLES.find((item) => item.id === id)
  if (!font) return {}
  return {
    fontFamily: `"${font.family}", ${font.family.startsWith("Noto Serif") ? "serif" : "sans-serif"}`,
    fontWeight: font.weight,
    fontStyle: "italic" in font && font.italic ? "italic" : "normal",
  }
}

// Google Fonts stylesheet URL for the given font ids (others are ignored), or "" if none.
// `text` limits the download to those letters (used for previews in the dashboard).
export function googleFontsHref(ids: Iterable<string>, text?: string) {
  const styles = new Map<string, Set<string>>()
  for (const id of ids) {
    const font = parseGoogleFont(id)
    if (!font) continue
    const set = styles.get(font.family) ?? new Set<string>()
    set.add(`${font.italic ? 1 : 0},${font.weight}`)
    styles.set(font.family, set)
  }
  if (styles.size === 0) return ""
  const families = [...styles].map(([family, set]) => {
    const tuples = [...set].sort((a, b) => Number(a[0]) - Number(b[0]) || Number(a.slice(2)) - Number(b.slice(2)))
    return `family=${encodeURIComponent(family).replace(/%20/g, "+")}:ital,wght@${tuples.join(";")}`
  })
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap${text ? `&text=${encodeURIComponent(text)}` : ""}`
}

// Every Google font id used anywhere in a piece of content.
export function usedGoogleFonts(content: unknown) {
  return [...new Set(JSON.stringify(content).match(/g:[a-z]:[^":]+:\d{3}i?/g) ?? [])]
}

// Keeps one <link> per purpose in <head> pointing at the fonts it needs.
export function loadGoogleFonts(key: string, href: string) {
  const id = `google-fonts-${key}`
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (!href) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}
