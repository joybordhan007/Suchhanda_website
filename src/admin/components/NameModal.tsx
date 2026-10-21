import { useState, type FormEvent } from "react"
import { primaryButton, secondaryButton } from "../styles"
import Modal from "./Modal"
import TextField from "./TextField"

type NameModalProps = {
  title: string
  label: string
  placeholder?: string
  hint?: string
  submitLabel: string
  onSubmit: (name: string) => Promise<void>
  onClose: () => void
}

// Asks for a name before creating something; the details are filled in afterwards.
export default function NameModal({ title, label, placeholder, hint, submitLabel, onSubmit, onClose }: NameModalProps) {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError("")
    try {
      await onSubmit(name.trim())
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create it.")
      setBusy(false)
    }
  }

  return (
    <Modal
      footer={
        <>
          <button className={secondaryButton} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={primaryButton} disabled={busy || !name.trim()} onClick={() => void submit()} type="button">
            {busy ? "Creating…" : submitLabel}
          </button>
        </>
      }
      onClose={onClose}
      title={title}
    >
      <form onSubmit={submit}>
        <TextField autoFocus hint={hint} label={label} onChange={setName} placeholder={placeholder} value={name} />
      </form>
      {error && <p className="text-[14px] text-red-700">{error}</p>}
    </Modal>
  )
}
