import { useState, type FormEvent } from "react"
import { api } from "../../content/api"
import Panel from "../components/Panel"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"

type AccountSectionProps = {
  email: string
  onSignOut: () => void
}

export default function AccountSection({ email, onSignOut }: AccountSectionProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "done" | "error"; text?: string }>({ kind: "idle" })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (newPassword !== confirm) {
      setStatus({ kind: "error", text: "The new passwords do not match." })
      return
    }
    setStatus({ kind: "saving" })
    try {
      await api("/auth/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) })
      setCurrentPassword("")
      setNewPassword("")
      setConfirm("")
      setStatus({ kind: "done", text: "Password changed. Other devices have been signed out." })
    } catch (error) {
      setStatus({ kind: "error", text: error instanceof Error ? error.message : "Could not change the password." })
    }
  }

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader description={`Signed in as ${email}.`} title="Account" />
      <Panel title="Change password">
        <form className="flex max-w-[420px] flex-col gap-[16px]" onSubmit={submit}>
          <TextField label="Current password" onChange={setCurrentPassword} type="password" value={currentPassword} />
          <TextField hint="At least 10 characters." label="New password" onChange={setNewPassword} type="password" value={newPassword} />
          <TextField label="Repeat new password" onChange={setConfirm} type="password" value={confirm} />
          <button
            className="self-start rounded-[8px] bg-[#091e39] px-[18px] py-[10px] text-[14px] font-medium text-white disabled:opacity-50"
            disabled={status.kind === "saving" || !currentPassword || !newPassword}
            type="submit"
          >
            Change password
          </button>
          {status.text && (
            <p className={`text-[14px] ${status.kind === "error" ? "text-red-700" : "text-green-800"}`} role="status">
              {status.text}
            </p>
          )}
        </form>
      </Panel>
      <Panel title="Sign out">
        <button
          className="self-start rounded-[8px] border border-[rgba(25,25,25,0.2)] px-[18px] py-[10px] text-[14px] hover:text-red-700"
          onClick={onSignOut}
          type="button"
        >
          Sign out of the dashboard
        </button>
      </Panel>
    </div>
  )
}
