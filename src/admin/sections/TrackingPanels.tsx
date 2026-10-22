import { useEffect, useState, type ReactNode } from "react"
import { api } from "../../content/api"
import type { SiteContent, TrackingSettings } from "../../content/types"
import { GTM_ID_PATTERN, META_PIXEL_ID_PATTERN } from "../../tracking"
import Icon from "../components/Icon"
import PasswordField from "../components/PasswordField"
import TextField from "../components/TextField"
import Toggle from "../components/Toggle"
import { formatDateTime } from "../format"
import { primaryButton } from "../styles"
import type { ManagedSectionProps } from "../types"

type MetaStatus = { tokenSet: boolean; testEventCode: string; lastResult: { ok: boolean; at: string; message: string } | null }
type Message = { kind: "saved" | "error"; text: string } | null

function TrackerCard({
  logo,
  title,
  description,
  enabled,
  onToggle,
  children,
  footer,
}: {
  logo: ReactNode
  title: string
  description: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <section className="admin-card flex flex-col">
      <header className="flex flex-wrap items-start justify-between gap-[16px] p-[20px] sm:p-[24px]">
        <div className="flex min-w-0 items-start gap-[14px]">
          <span className="flex size-[44px] shrink-0 items-center justify-center rounded-[4px] border border-[var(--admin-border)] bg-[#f9fafb]">{logo}</span>
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-[8px] text-[16px] font-semibold">
              {title}
              <span className={`admin-badge ${enabled ? "bg-[#ecfdf3] text-[#067647]" : "bg-[#f2f4f7] text-[#475467]"}`}>{enabled ? "On" : "Off"}</span>
            </h2>
            <p className="mt-[4px] max-w-[620px] text-[14px] leading-[1.5] text-[var(--admin-muted)]">{description}</p>
          </div>
        </div>
        <Toggle checked={enabled} label={`Turn ${title} on or off`} offText="Off" onChange={onToggle} onText="On" />
      </header>
      <div className="flex flex-col gap-[18px] border-t border-[var(--admin-border)] p-[20px] sm:p-[24px]">{children}</div>
      <footer className="flex flex-wrap items-center justify-end gap-[12px] rounded-b-[4px] border-t border-[var(--admin-border)] bg-[#fcfcfd] px-[20px] py-[14px] sm:px-[24px]">
        {footer}
      </footer>
    </section>
  )
}

function SaveFooter({ dirty, saving, message, disabled, onSave }: { dirty: boolean; saving: boolean; message: Message; disabled?: boolean; onSave: () => void }) {
  return (
    <>
      <span aria-live="polite" className="mr-auto text-[13px] font-medium">
        {message ? (
          <span className={message.kind === "error" ? "text-[#b42318]" : "text-[#067647]"}>{message.text}</span>
        ) : dirty ? (
          <span className="admin-badge bg-[#fdf6e9] text-[var(--admin-gold-ink)]">Unsaved changes</span>
        ) : null}
      </span>
      <button className={primaryButton} disabled={!dirty || saving || disabled} onClick={onSave} type="button">
        {saving ? "Saving…" : "Save"}
      </button>
    </>
  )
}

function IdHint({ value, pattern, problem, hint }: { value: string; pattern: RegExp; problem: string; hint: string }) {
  if (!value) return <p className="-mt-[10px] text-[13px] text-[var(--admin-muted)]">{hint}</p>
  return pattern.test(value) ? (
    <p className="-mt-[10px] flex items-center gap-[6px] text-[13px] text-[#067647]">✓ Valid ID</p>
  ) : (
    <p className="-mt-[10px] text-[13px] text-[#b42318]">{problem}</p>
  )
}

const EventList = ({ events }: { events: [string, string][] }) => (
  <div className="rounded-[4px] bg-[#f9fafb] p-[14px]">
    <p className="mb-[8px] text-[13px] font-semibold text-[var(--admin-text-2)]">Events sent automatically</p>
    <ul className="grid gap-[6px] text-[13px] text-[var(--admin-muted)] sm:grid-cols-2">
      {events.map(([name, when]) => (
        <li className="flex items-center gap-[8px]" key={name}>
          <code className="rounded-[4px] border border-[var(--admin-border)] bg-white px-[6px] py-[1px] text-[12px] text-[var(--admin-text)]">{name}</code>
          {when}
        </li>
      ))}
    </ul>
  </div>
)

type Props = Pick<ManagedSectionProps, "commit"> & { content: SiteContent }

function GtmCard({ content, commit }: Props) {
  const saved = content.settings.tracking
  const [enabled, setEnabled] = useState(saved.gtmEnabled)
  const [id, setId] = useState(saved.gtmId)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message>(null)
  const dirty = enabled !== saved.gtmEnabled || id !== saved.gtmId
  const invalid = enabled && !GTM_ID_PATTERN.test(id)

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await commit((current) => ({
        ...current,
        settings: { ...current.settings, tracking: { ...current.settings.tracking, gtmEnabled: enabled, gtmId: id } },
      }))
      setMessage({ kind: "saved", text: enabled ? "Saved — Tag Manager is live on the website." : "Saved — Tag Manager is off." })
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Could not save." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <TrackerCard
      description="Loads your Tag Manager container on every page, so tags such as Google Analytics 4 and Google Ads conversions can be managed in tagmanager.google.com."
      enabled={enabled}
      footer={<SaveFooter dirty={dirty} disabled={invalid} message={message} onSave={() => void save()} saving={saving} />}
      logo={<span className="text-[13px] font-bold text-[#2a78d6]">GTM</span>}
      onToggle={(next) => {
        setEnabled(next)
        setMessage(null)
      }}
      title="Google Tag Manager"
    >
      <div className="max-w-[420px]">
        <TextField
          label="Container ID"
          onChange={(next) => {
            setId(next.trim().toUpperCase())
            setMessage(null)
          }}
          placeholder="GTM-XXXXXXX"
          value={id}
        />
      </div>
      <IdHint hint="Find it at the top of your container in tagmanager.google.com." pattern={GTM_ID_PATTERN} problem="A container ID starts with GTM- followed by letters and numbers." value={id} />
      <EventList
        events={[
          ["page_view", "every page"],
          ["generate_lead", "contact form sent"],
        ]}
      />
    </TrackerCard>
  )
}

function MetaCard({ content, commit }: Props) {
  const saved: TrackingSettings = content.settings.tracking
  const [status, setStatus] = useState<MetaStatus | null>(null)
  const [enabled, setEnabled] = useState(saved.metaPixelEnabled)
  const [pixelId, setPixelId] = useState(saved.metaPixelId)
  // undefined: keep the stored token; "": remove it; text: replace it.
  const [token, setToken] = useState<string | undefined>(undefined)
  const [testCode, setTestCode] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message>(null)

  useEffect(() => {
    api<{ meta: MetaStatus }>("/tracking")
      .then(({ meta }) => {
        setStatus(meta)
        setTestCode(meta.testEventCode)
      })
      .catch(() => setStatus({ tokenSet: false, testEventCode: "", lastResult: null }))
  }, [])

  const publicDirty = enabled !== saved.metaPixelEnabled || pixelId !== saved.metaPixelId
  const privateDirty = token !== undefined || testCode !== (status?.testEventCode ?? "")
  const invalid = enabled && !META_PIXEL_ID_PATTERN.test(pixelId)
  const change = (apply: () => void) => {
    apply()
    setMessage(null)
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      if (privateDirty) {
        const body: Record<string, unknown> = { testEventCode: testCode.trim() }
        if (token !== undefined) body.accessToken = token.trim() === "" ? null : token.trim()
        const { meta } = await api<{ meta: MetaStatus }>("/tracking/meta", { method: "PUT", body: JSON.stringify(body) })
        setStatus(meta)
        setToken(undefined)
      }
      if (publicDirty) {
        await commit((current) => ({
          ...current,
          settings: { ...current.settings, tracking: { ...current.settings.tracking, metaPixelEnabled: enabled, metaPixelId: pixelId } },
        }))
      }
      setMessage({ kind: "saved", text: enabled ? "Saved — the Pixel is live on the website." : "Saved — the Pixel is off." })
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Could not save." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <TrackerCard
      description="Loads the Meta Pixel on every page for Facebook and Instagram ads. Add a Conversions API token to also send leads from the server, so they are counted even when browsers block the Pixel."
      enabled={enabled}
      footer={<SaveFooter dirty={publicDirty || privateDirty} disabled={invalid || status === null} message={message} onSave={() => void save()} saving={saving} />}
      logo={<span className="text-[15px] font-bold text-[#0866ff]">∞</span>}
      onToggle={(next) => change(() => setEnabled(next))}
      title="Meta (Facebook) Pixel"
    >
      <div className="max-w-[420px]">
        <TextField label="Pixel ID" onChange={(next) => change(() => setPixelId(next.replace(/\s/g, "")))} placeholder="123456789012345" value={pixelId} />
      </div>
      <IdHint hint="Events Manager → Data sources → your Pixel → Settings." pattern={META_PIXEL_ID_PATTERN} problem="A Pixel ID is a number of 10 to 20 digits." value={pixelId} />

      <div className="flex flex-col gap-[14px] rounded-[4px] border border-[var(--admin-border)] p-[16px]">
        <div>
          <h3 className="text-[14px] font-semibold">Conversions API (optional)</h3>
          <p className="mt-[2px] text-[13px] leading-[1.5] text-[var(--admin-muted)]">
            The token is stored only on the server and never shown again. Create it in Events Manager → Settings → Conversions API → Generate access token.
          </p>
        </div>
        {status?.tokenSet && token === undefined ? (
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className="admin-badge bg-[#ecfdf3] text-[#067647]">
              <Icon name="eye" size={12} /> Token saved
            </span>
            <button className="admin-btn admin-btn-secondary h-[34px]" onClick={() => change(() => setToken(""))} type="button">
              Replace token
            </button>
            <button className="admin-btn admin-btn-ghost h-[34px] hover:text-[#b42318]" onClick={() => change(() => setToken(""))} type="button">
              Remove
            </button>
          </div>
        ) : (
          <div className="max-w-[520px]">
            <PasswordField
              autoComplete="off"
              hint={status?.tokenSet ? "Leave empty and save to remove the saved token." : undefined}
              label="Access token"
              onChange={(next) => change(() => setToken(next))}
              value={token ?? ""}
            />
          </div>
        )}
        <div className="max-w-[260px]">
          <TextField
            hint="Only while testing in Events Manager → Test events. Clear it afterwards."
            label="Test event code"
            onChange={(next) => change(() => setTestCode(next.trim()))}
            placeholder="TEST12345"
            value={testCode}
          />
        </div>
        {status?.lastResult && (
          <p className={`text-[13px] ${status.lastResult.ok ? "text-[#067647]" : "text-[#b42318]"}`}>
            Last server event ({formatDateTime(status.lastResult.at)}): {status.lastResult.message}
          </p>
        )}
      </div>

      <EventList
        events={[
          ["PageView", "every page"],
          ["Lead", "contact form sent (browser + server)"],
        ]}
      />
    </TrackerCard>
  )
}

// Tracking is saved per tracker with its own button, separately from the rest of Site Settings.
export default function TrackingPanels(props: Props) {
  return (
    <div className="flex flex-col gap-[16px]">
      <div>
        <h2 className="text-[20px] font-semibold tracking-[-0.01em]">Tracking</h2>
        <p className="mt-[4px] text-[14px] text-[var(--admin-muted)]">
          Trackers load only on the public website, never in this dashboard. Each one has its own Save button.
        </p>
      </div>
      <GtmCard {...props} />
      <MetaCard {...props} />
    </div>
  )
}
