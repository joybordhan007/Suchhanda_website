import type { CSSProperties } from "react"

// Font styles a hero title or description can use: the faces the website already loads
// (see the @font-face rules at the top of index.css). Sizes are left to the design.
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

export type FontStyleId = (typeof FONT_STYLES)[number]["id"]

export function isFontStyleId(value: unknown): value is FontStyleId {
  return FONT_STYLES.some((font) => font.id === value)
}

// Inline style for a font choice; unknown ids leave the design's own font in place.
export function fontStyle(id: string | undefined): CSSProperties {
  const font = FONT_STYLES.find((item) => item.id === id)
  if (!font) return {}
  return {
    fontFamily: `"${font.family}", ${font.family.startsWith("Noto Serif") ? "serif" : "sans-serif"}`,
    fontWeight: font.weight,
    fontStyle: "italic" in font && font.italic ? "italic" : "normal",
  }
}
