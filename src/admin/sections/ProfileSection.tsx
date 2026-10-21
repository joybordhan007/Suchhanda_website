import { useState, type FormEvent } from "react"
import { api } from "../../content/api"
import type { AdminUser } from "../LoginPage"
import ImageField from "../components/ImageField"
import Panel from "../components/Panel"
import PasswordField from "../components/PasswordField"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import { primaryButton } from "../styles"

type Status = { kind: "idle" | "saving" | "done" | "error"; text?: string }

type ProfileSectionProps = {
  admin: AdminUser
  onProfileChange: (admin: AdminUser) => void
}

export default function ProfileSection({ admin, onProfileChange }: ProfileSectionProps) {
  const [name, setName] = useState(admin.name)
  const [avatar, setAvatar] = useState(admin.avatar)
  const [profileStatus, setProfileStatus] = useState<Status>({ kind: "idle" })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [passwordStatus, setPasswordStatus] = useState<Status>({ kind: "idle" })
  const profileDirty = name !== admin.name || avatar !== admin.avatar

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault()
    setProfileStatus({ kind: "saving" })
    try {
      const { admin: updated } = await api<{ admin: AdminUser }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ name, avatar }),
      })
      onProfileChange(updated)
      setProfileStatus({ kind: "done", text: "Profile saved." })
    } catch (error) {
      setProfileStatus({ kind: "error", text: error instanceof Error ? error.message : "Could not save the profile." })
    }
  }

  const changePassword = async (event: FormEvent) => {
    event.preventDefault()
    if (newPassword !== confirm) {
      setPasswordStatus({ kind: "error", text: "The new passwords do not match." })
      return
    }
    setPasswordStatus({ kind: "saving" })
    try {
      await api("/auth/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) })
      setCurrentPassword("")
      setNewPassword("")
      setConfirm("")
      setPasswordStatus({ kind: "done", text: "Password changed. Other devices have been signed out." })
    } catch (error) {
      setPasswordStatus({ kind: "error", text: error instanceof Error ? error.message : "Could not change the password." })
    }
  }

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader description="Your name and photo are shown in the dashboard menu." title="Profile" />

      <Panel title="Profile">
        <form className="flex flex-col gap-[16px]" onSubmit={saveProfile}>
          <ImageField
            hint="Square photo, shown as a small circle."
            label="Photo"
            onChange={setAvatar}
            previewClass="aspect-square w-[140px]! rounded-full"
            value={avatar}
          />
          <div className="grid gap-[16px] md:grid-cols-2">
            <TextField label="Name" onChange={setName} placeholder="Your name" value={name} />
            <div className="flex flex-col gap-[6px]">
              <span className="admin-label">Login email</span>
              <p className="admin-input bg-[#f9fafb] text-[var(--admin-muted)] shadow-none">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <button className={primaryButton} disabled={!profileDirty || profileStatus.kind === "saving"} type="submit">
              {profileStatus.kind === "saving" ? "Saving…" : "Save profile"}
            </button>
            {profileStatus.text && (
              <span className={`text-[14px] ${profileStatus.kind === "error" ? "text-red-700" : "text-green-800"}`} role="status">
                {profileStatus.text}
              </span>
            )}
          </div>
        </form>
      </Panel>

      <Panel
        description="Your current password is stored encrypted, so nobody — not even this dashboard — can read it back. Use “Show” to check what you type."
        title="Change password"
      >
        <form className="flex max-w-[440px] flex-col gap-[16px]" onSubmit={changePassword}>
          <PasswordField label="Current password" onChange={setCurrentPassword} value={currentPassword} />
          <PasswordField autoComplete="new-password" hint="At least 10 characters." label="New password" onChange={setNewPassword} value={newPassword} />
          <PasswordField autoComplete="new-password" label="Repeat new password" onChange={setConfirm} value={confirm} />
          <div className="flex items-center gap-[12px]">
            <button
              className={primaryButton}
              disabled={passwordStatus.kind === "saving" || !currentPassword || !newPassword || !confirm}
              type="submit"
            >
              {passwordStatus.kind === "saving" ? "Saving…" : "Change password"}
            </button>
            {passwordStatus.text && (
              <span className={`text-[14px] ${passwordStatus.kind === "error" ? "text-red-700" : "text-green-800"}`} role="status">
                {passwordStatus.text}
              </span>
            )}
          </div>
        </form>
      </Panel>
    </div>
  )
}
