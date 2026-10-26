import { useEffect, useState } from "react"
import { api } from "../../content/api"
import Panel from "../components/Panel"
import PasswordField from "../components/PasswordField"
import TextField from "../components/TextField"
import { formatDateTime } from "../format"
import { primaryButton, secondaryButton } from "../styles"

type MailStatus = {
  to: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  passwordSet: boolean
  siteEmail: string
  recipients: string[]
  lastResult: { ok: boolean; at: string; message: string } | null
}

// Where contact form messages are emailed, and how (SMTP or the server's own mail).
// Saved on its own, apart from the site content.
export default function MailPanel() {
  const [status, setStatus] = useState<MailStatus | null>(null)
  const [form, setForm] = useState({ to: "", smtpHost: "", smtpPort: "465", smtpUser: "", smtpPass: "" })
  const [busy, setBusy] = useState<"save" | "test" | null>(null)
  const [error, setError] = useState("")

  const apply = (mail: MailStatus) => {
    setStatus(mail)
    setForm({ to: mail.to, smtpHost: mail.smtpHost, smtpPort: String(mail.smtpPort), smtpUser: mail.smtpUser, smtpPass: "" })
  }

  useEffect(() => {
    api<{ mail: MailStatus }>("/mail")
      .then(({ mail }) => apply(mail))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load the email settings."))
  }, [])

  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }))

  const save = async () => {
    setBusy("save")
    setError("")
    try {
      const { mail } = await api<{ mail: MailStatus }>("/mail", {
        method: "PUT",
        body: JSON.stringify({ ...form, smtpPort: Number(form.smtpPort), smtpPass: form.smtpPass || undefined }),
      })
      apply(mail)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save.")
    } finally {
      setBusy(null)
    }
  }

  const test = async () => {
    setBusy("test")
    setError("")
    try {
      const { mail } = await api<{ mail: MailStatus }>("/mail/test", { method: "POST" })
      setStatus(mail)
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Could not send the test email.")
    } finally {
      setBusy(null)
    }
  }

  const changed =
    status !== null &&
    (form.to !== status.to || form.smtpHost !== status.smtpHost || form.smtpPort !== String(status.smtpPort) || form.smtpUser !== status.smtpUser || form.smtpPass !== "")

  return (
    <Panel
      description="Every message from the Contact page is saved under Messages and also emailed here. Save, then send a test email to check it arrives (look in Spam too)."
      title="Contact form emails"
    >
      <TextField
        hint={`Separate several addresses with commas. Leave empty to use the contact email above${status?.siteEmail ? ` (${status.siteEmail})` : ""}.`}
        label="Send messages to"
        onChange={(to) => set({ to })}
        placeholder={status?.siteEmail || "you@example.com"}
        value={form.to}
      />

      <details className="group rounded-[4px] border border-[var(--admin-border)] bg-[#fcfcfd]" open={Boolean(status?.smtpHost)}>
        <summary className="cursor-pointer list-none px-[16px] py-[12px] text-[14px] font-semibold text-[var(--admin-text)]">
          Sending server (SMTP) — optional
          <span className="ml-[8px] font-normal text-[var(--admin-muted)]">{form.smtpHost ? "in use" : "not set: the website server sends the email itself"}</span>
        </summary>
        <div className="flex flex-col gap-[16px] border-t border-[var(--admin-border)] p-[16px]">
          <p className="text-[13px] leading-[1.5] text-[var(--admin-muted)]">
            Use this if emails do not arrive. In cPanel → Email Accounts, create an address such as info@your-domain and use its settings
            (Connect Devices shows the server name and port).
          </p>
          <div className="grid gap-[16px] md:grid-cols-[1fr_140px]">
            <TextField label="SMTP server" onChange={(smtpHost) => set({ smtpHost })} placeholder="mail.suchhandamondol.com" value={form.smtpHost} />
            <TextField hint="465 (SSL) or 587" label="Port" onChange={(smtpPort) => set({ smtpPort })} type="number" value={form.smtpPort} />
          </div>
          <div className="grid gap-[16px] md:grid-cols-2">
            <TextField hint="Usually the full email address." label="Username" onChange={(smtpUser) => set({ smtpUser })} value={form.smtpUser} />
            <PasswordField
              hint={status?.passwordSet ? "A password is saved. Type a new one only to change it." : "The email account's password."}
              autoComplete="new-password"
              label="Password"
              onChange={(smtpPass) => set({ smtpPass })}
              value={form.smtpPass}
            />
          </div>
        </div>
      </details>

      {error && <p className="rounded-[4px] border border-[#fecdca] bg-[#fef3f2] px-[14px] py-[10px] text-[14px] text-[#b42318]">{error}</p>}
      {status?.lastResult && (
        <p className={`rounded-[4px] px-[14px] py-[10px] text-[13px] ${status.lastResult.ok ? "bg-[#ecfdf3] text-[#067647]" : "bg-[#fef3f2] text-[#b42318]"}`}>
          Last email {status.lastResult.ok ? "sent" : "failed"} {formatDateTime(status.lastResult.at)}: {status.lastResult.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-[10px]">
        <button className={primaryButton} disabled={!changed || busy !== null} onClick={() => void save()} type="button">
          {busy === "save" ? "Saving…" : "Save"}
        </button>
        <button className={secondaryButton} disabled={changed || busy !== null || !status?.recipients.length} onClick={() => void test()} type="button">
          {busy === "test" ? "Sending…" : "Send test email"}
        </button>
        {status && <span className="text-[13px] text-[var(--admin-muted)]">Goes to: {status.recipients.join(", ") || "no address yet"}</span>}
      </div>
    </Panel>
  )
}
