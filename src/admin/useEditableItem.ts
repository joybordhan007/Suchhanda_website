import { useEffect, useState } from "react"

type Message = { kind: "saved" | "error"; text: string } | null

// Local copy of one item for a detail editor; nothing is saved until `submit`.
export function useEditableItem<T extends object>(item: T, save: (next: T) => Promise<void>) {
  const [value, setValue] = useState(item)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message>(null)
  const isDirty = JSON.stringify(value) !== JSON.stringify(item)

  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [isDirty])

  const update = (patch: Partial<T>) => {
    setValue((current) => ({ ...current, ...patch }))
    setMessage(null)
  }

  const submit = async () => {
    setSaving(true)
    try {
      await save(value)
      setMessage({ kind: "saved", text: "Saved — live on the website." })
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Could not save." })
    } finally {
      setSaving(false)
    }
  }

  const confirmLeave = () => !isDirty || window.confirm("You have unsaved changes. Leave without saving?")

  return { value, update, isDirty, saving, message, submit, confirmLeave }
}
