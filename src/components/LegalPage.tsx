import { Fragment } from "react"
import type { TextKey } from "../content/siteText"
import { useSiteContent } from "../content/store"
import Footer from "./Footer"
import { useSiteText } from "./Txt"

type LegalPageProps = { title: TextKey; subtitle: TextKey; updated: TextKey; body: TextKey }

// Privacy Policy and Terms of Service: all text comes from Site Text. In the page text,
// "# " starts the main heading, "## " a section heading and an empty line a new paragraph.
export default function LegalPage({ title, subtitle, updated, body }: LegalPageProps) {
  const { settings } = useSiteContent()
  const text = useSiteText()
  const headings = text("legal.headings").style
  const paragraphs = text("legal.paragraphs").style
  const blocks = text(body)
    .text.split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  // "{email}" becomes a link to the contact email.
  const withEmail = (line: string) =>
    line.split("{email}").map((part, index) => (
      <Fragment key={index}>
        {index > 0 && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
        {part}
      </Fragment>
    ))

  return (
    <div className="legal-page">
      <header className="legal-hero">
        <p style={text(title).style}>{text(title).text}</p>
        <span style={text(subtitle).style}>{text(subtitle).text}</span>
      </header>
      <main className="legal-content">
        <p className="legal-updated" style={text(updated).style}>
          {text(updated).text}
        </p>
        {blocks.map((block, index) => {
          if (block.startsWith("## ")) return <h2 key={index} style={headings}>{block.slice(3)}</h2>
          if (block.startsWith("# ")) return <h1 key={index} style={headings}>{block.slice(2)}</h1>
          return (
            <p key={index} style={paragraphs}>
              {block.split("\n").map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  {withEmail(line)}
                </Fragment>
              ))}
            </p>
          )
        })}
      </main>
      <Footer />
    </div>
  )
}
