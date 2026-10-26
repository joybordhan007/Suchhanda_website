// Email copies of contact form messages. Sent through SMTP when it is set up in the
// dashboard, otherwise through the server's own mail program (sendmail, which cPanel
// hosting provides). The message is always saved in the dashboard first.
// nodemailer is loaded only when an email is sent, so the website still starts (and
// messages are still saved) if the package is missing on the host.
import type { Transporter } from "nodemailer"
import { config } from "./config.ts"
import { db, readSetting, writeSetting } from "./db.ts"

type MailSettings = {
  // Where messages go: one or more addresses separated by commas. Empty = the contact
  // email in Site Settings.
  to: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
}

export type MailResult = { ok: boolean; at: string; message: string }

const defaults: MailSettings = { to: "", smtpHost: "", smtpPort: 465, smtpUser: "", smtpPass: "" }

export const mailSettings = () => readSetting<MailSettings>("mail", defaults)
export const lastMailResult = () => readSetting<MailResult | null>("mail_last", null)

export function saveMailSettings(next: MailSettings) {
  writeSetting("mail", next)
}

// The contact email from Site Settings (in the public content).
function siteEmail() {
  const row = db.prepare("SELECT json FROM content WHERE id = 1").get() as { json: string } | undefined
  try {
    return String(JSON.parse(row?.json ?? "{}")?.settings?.email ?? "")
  } catch {
    return ""
  }
}

export function recipients() {
  return (mailSettings().to || siteEmail())
    .split(/[,;\s]+/)
    .map((address) => address.trim())
    .filter((address) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))
}

// What the dashboard may see: never the SMTP password.
export function publicMailStatus() {
  const { smtpPass, ...settings } = mailSettings()
  return { ...settings, passwordSet: smtpPass !== "", siteEmail: siteEmail(), recipients: recipients(), lastResult: lastMailResult() }
}

async function transport(): Promise<Transporter> {
  let nodemailer: typeof import("nodemailer")
  try {
    nodemailer = (await import("nodemailer")).default
  } catch {
    throw new Error("The email package is not installed on the server. In cPanel → Setup Node.js App, press Run NPM Install, then Restart.")
  }
  const settings = mailSettings()
  if (settings.smtpHost) {
    return nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465,
      auth: settings.smtpUser ? { user: settings.smtpUser, pass: settings.smtpPass } : undefined,
    })
  }
  return nodemailer.createTransport({ sendmail: true, newline: "unix", path: process.env.SENDMAIL_PATH ?? "/usr/sbin/sendmail" })
}

// Sender: the SMTP login when there is one (mail servers usually insist), otherwise
// no-reply@ the website's domain.
function sender(host: string) {
  const settings = mailSettings()
  const domain = (config.siteUrl ? new URL(config.siteUrl).hostname : host).replace(/^(www|admin)\./, "")
  const address = settings.smtpHost && settings.smtpUser.includes("@") ? settings.smtpUser : `no-reply@${domain}`
  return `"Website contact form" <${address}>`
}

async function send(mail: { subject: string; text: string; replyTo?: string }, host: string) {
  const to = recipients()
  if (to.length === 0) throw new Error("No email address to send to. Add one in Site Settings.")
  await (await transport()).sendMail({ from: sender(host), to, ...mail })
}

function record(result: Omit<MailResult, "at">) {
  writeSetting("mail_last", { ...result, at: new Date().toISOString() })
}

export type ContactMessage = {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  preferredContactTime: string
  message: string
}

// Never throws: a failed email must not lose the message, which is already saved.
export async function sendContactEmail(message: ContactMessage, host: string) {
  const name = `${message.firstName} ${message.lastName}`.trim()
  try {
    await send(
      {
        subject: `New inquiry from ${name}`,
        replyTo: message.email,
        text: [
          `${name} sent a message through the website contact form.`,
          "",
          `Name: ${name}`,
          `Email: ${message.email}`,
          `Phone: ${message.phone}`,
          `Company: ${message.company}`,
          `Preferred contact time: ${message.preferredContactTime}`,
          "",
          message.message,
          "",
          "Reply to this email to answer them directly. The message is also in the dashboard under Messages.",
        ].join("\n"),
      },
      host,
    )
    record({ ok: true, message: `Sent to ${recipients().join(", ")}` })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    console.error("Contact email failed:", reason)
    record({ ok: false, message: reason })
  }
}

export async function sendTestEmail(host: string) {
  try {
    await send({ subject: "Test email from your website", text: "This is a test. Contact form messages will arrive at this address." }, host)
    record({ ok: true, message: `Test sent to ${recipients().join(", ")}` })
  } catch (error) {
    record({ ok: false, message: error instanceof Error ? error.message : String(error) })
  }
  return lastMailResult()
}
