import { Fragment } from "react"

// Text with its line breaks kept (hero descriptions edited in the dashboard).
export function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  )
}
