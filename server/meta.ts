// Meta Conversions API: sends the contact form "Lead" from the server as well, so it is
// counted even when ad blockers stop the browser Pixel. The browser and server events
// share an event ID, which Meta uses to count them once.
import { createHash } from "node:crypto"
import { db } from "./db.ts"

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v23.0"

type PrivateMetaSettings = { accessToken: string; testEventCode: string }
export type MetaResult = { ok: boolean; at: string; message: string }

function readSetting<T>(key: string, fallback: T): T {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined
  if (!row) return fallback
  try {
    return { ...fallback, ...JSON.parse(row.value) } as T
  } catch {
    return fallback
  }
}

function writeSetting(key: string, value: unknown) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(
    key,
    JSON.stringify(value),
  )
}

export const metaSettings = () => readSetting<PrivateMetaSettings>("meta_capi", { accessToken: "", testEventCode: "" })

export function saveMetaSettings(next: PrivateMetaSettings) {
  writeSetting("meta_capi", next)
}

export const lastMetaResult = () => readSetting<MetaResult | null>("meta_capi_last", null)

// What the dashboard may see: never the token itself.
export function publicMetaStatus() {
  const settings = metaSettings()
  return { tokenSet: settings.accessToken !== "", testEventCode: settings.testEventCode, lastResult: lastMetaResult() }
}

// Pixel ID and on/off switch live in the public site content.
function pixelFromContent() {
  const row = db.prepare("SELECT json FROM content WHERE id = 1").get() as { json: string } | undefined
  if (!row) return null
  try {
    const tracking = JSON.parse(row.json)?.settings?.tracking
    // Same rule as the website (src/content/store.ts): saves from before the switch
    // existed count a filled-in ID as on.
    const enabled = tracking?.metaPixelEnabled ?? Boolean(tracking?.metaPixelId)
    if (!enabled || !/^\d{10,20}$/.test(tracking?.metaPixelId ?? "")) return null
    return tracking.metaPixelId as string
  } catch {
    return null
  }
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex")

export async function sendMetaLead(lead: {
  eventId: string
  email: string
  phone: string
  firstName: string
  lastName: string
  ip: string
  userAgent: string
  sourceUrl: string
  fbp?: string
  fbc?: string
}) {
  const pixelId = pixelFromContent()
  const { accessToken, testEventCode } = metaSettings()
  if (!pixelId || !accessToken) return

  const userData: Record<string, unknown> = {
    em: [sha256(lead.email.trim().toLowerCase())],
    fn: [sha256(lead.firstName.trim().toLowerCase())],
    ln: [sha256(lead.lastName.trim().toLowerCase())],
    client_user_agent: lead.userAgent,
  }
  const digits = lead.phone.replace(/\D/g, "")
  if (digits) userData.ph = [sha256(digits)]
  if (lead.ip && lead.ip !== "unknown") userData.client_ip_address = lead.ip
  if (lead.fbp) userData.fbp = lead.fbp
  if (lead.fbc) userData.fbc = lead.fbc

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: lead.eventId || undefined,
        action_source: "website",
        event_source_url: lead.sourceUrl || undefined,
        user_data: userData,
      },
    ],
  }
  if (testEventCode) body.test_event_code = testEventCode

  let result: MetaResult
  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })
    const data = (await response.json().catch(() => ({}))) as { events_received?: number; error?: { message?: string } }
    result = response.ok
      ? { ok: true, at: new Date().toISOString(), message: `Lead sent (${data.events_received ?? 1} event received).` }
      : { ok: false, at: new Date().toISOString(), message: data.error?.message ?? `Meta answered ${response.status}.` }
  } catch (error) {
    result = { ok: false, at: new Date().toISOString(), message: error instanceof Error ? error.message : "Could not reach Meta." }
  }
  writeSetting("meta_capi_last", result)
}
