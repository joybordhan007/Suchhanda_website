import { Fragment } from "react"

// Renders "Plain *gold* text", where words between stars use the brand gold and
// line breaks in the text are kept.
export default function HighlightText({ text, className = "leading-[1.2]" }: { text: string; className?: string }) {
  return (
    <>
      {text.split("\n").map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line.split("*").map((part, index) =>
            part ? (
              <span className={index % 2 ? `${className} text-[#c7994b]` : className} key={index}>
                {part}
              </span>
            ) : null,
          )}
        </Fragment>
      ))}
    </>
  )
}
