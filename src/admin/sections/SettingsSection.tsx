import { useState } from "react"
import type { SocialLink } from "../../content/types"
import ImageField from "../components/ImageField"
import ListEditor from "../components/ListEditor"
import Panel from "../components/Panel"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import { newId, type SectionProps } from "../types"
import TrackingPanels from "./TrackingPanels"

// Built-in icons exist for the platforms the site shipped with; others need an uploaded icon.
const presets = [
  { label: "Facebook", url: "https://www.facebook.com/", icon: "/assets/4aa89.svg" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/", icon: "/assets/0684a.svg" },
  { label: "WhatsApp", url: "https://wa.me/880", icon: "/assets/a4902.svg" },
  { label: "Instagram", url: "https://www.instagram.com/", icon: "" },
  { label: "YouTube", url: "https://www.youtube.com/@", icon: "" },
  { label: "TikTok", url: "https://www.tiktok.com/@", icon: "" },
  { label: "X (Twitter)", url: "https://x.com/", icon: "" },
  { label: "Telegram", url: "https://t.me/", icon: "" },
  { label: "Other", url: "https://", icon: "" },
]

export default function SettingsSection({ content, onChange, commit }: SectionProps) {
  const { settings } = content
  const [preset, setPreset] = useState(presets[0].label)
  const set = (patch: Partial<typeof settings>) => onChange({ settings: { ...settings, ...patch } })

  const addSocial = () => {
    const chosen = presets.find((item) => item.label === preset) ?? presets[presets.length - 1]
    const link: SocialLink = {
      id: newId(),
      label: chosen.label === "Other" ? "" : chosen.label,
      url: chosen.url,
      icon: chosen.icon,
    }
    set({ socials: [...settings.socials, link] })
  }

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        description="Contact details and social links. They appear in the footer, on the Contact page and in the legal pages."
        title="Site Settings"
      />
      <Panel title="Contact information">
        <div className="grid gap-[20px] md:grid-cols-2">
          <TextField label="Name" onChange={(ownerName) => set({ ownerName })} value={settings.ownerName} />
          <TextField label="Email" onChange={(email) => set({ email })} type="email" value={settings.email} />
          <TextField label="Phone" onChange={(phone) => set({ phone })} type="tel" value={settings.phone} />
          <TextField
            hint="Also used for the Google Map on the Contact page."
            label="Address"
            onChange={(address) => set({ address })}
            value={settings.address}
          />
        </div>
      </Panel>
      <Panel
        description="Shown as icons in the footer, in this order. Add as many as you like."
        title="Social links"
      >
        <ListEditor
          emptyText="No social links yet."
          itemTitle={(link) => link.label || link.url}
          items={settings.socials}
          onChange={(socials) => set({ socials })}
          openByDefault={false}
          renderItem={(link, update) => (
            <>
              <div className="grid gap-[16px] md:grid-cols-2">
                <TextField label="Name" onChange={(label) => update({ label })} placeholder="Instagram" value={link.label} />
                <TextField
                  hint="Full link, starting with https://"
                  label="Link"
                  onChange={(url) => update({ url })}
                  type="url"
                  value={link.url}
                />
              </div>
              <ImageField
                hint="Square icon, about 32×32. Without an icon the first letter of the name is shown."
                label="Icon"
                onChange={(icon) => update({ icon })}
                previewClass="h-[64px]"
                value={link.icon}
              />
            </>
          )}
        />
        <div className="flex flex-wrap items-center gap-[10px]">
          <select
            aria-label="Social network"
            className="admin-input h-[38px] w-auto py-0"
            onChange={(event) => setPreset(event.target.value)}
            value={preset}
          >
            {presets.map((item) => (
              <option key={item.label}>{item.label}</option>
            ))}
          </select>
          <button
            className="admin-btn h-[38px] border-dashed border-[var(--admin-gold)] bg-[#fdf8ee] text-[var(--admin-gold-ink)] hover:bg-[#faefd8]"
            onClick={addSocial}
            type="button"
          >
            + Add social link
          </button>
        </div>
      </Panel>
      {commit && <TrackingPanels commit={commit} content={content} />}
    </div>
  )
}

