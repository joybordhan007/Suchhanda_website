import type { ReactNode } from "react"
import { primaryButton, secondaryButton } from "../styles"
import Icon from "./Icon"

type EditorBarProps = {
  backLabel: string
  onBack: () => void
  title: string
  subtitle?: string
  status: ReactNode
  isDirty: boolean
  saving: boolean
  message?: { kind: "saved" | "error"; text: string } | null
  onSave: () => void
}

// Sticky header of a detail editor: back link, name, status switch and Save.
export default function EditorBar({ backLabel, onBack, title, subtitle, status, isDirty, saving, message, onSave }: EditorBarProps) {
  return (
    <div className="sticky top-[64px] z-10 -mx-[16px] -mt-[28px] mb-[4px] flex flex-col gap-[10px] border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/90 px-[16px] pt-[16px] pb-[14px] backdrop-blur-md sm:-mx-[32px] sm:px-[32px]">
      <button className="flex items-center gap-[4px] self-start text-[13px] font-semibold text-[var(--admin-muted)] hover:text-[var(--admin-text)]" onClick={onBack} type="button">
        <Icon name="back" size={16} />
        {backLabel}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <div className="min-w-0">
          <h1 className="truncate text-[24px] font-semibold tracking-[-0.02em] text-[var(--admin-text)]">{title || "Untitled"}</h1>
          {subtitle && <p className="text-[13px] text-[var(--admin-muted)]">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-[12px]">
          {status}
          <span aria-live="polite" className="text-[13px] font-medium">
            {message?.kind === "error" ? (
              <span className="text-[#b42318]">{message.text}</span>
            ) : isDirty ? (
              <span className="admin-badge bg-[#fdf6e9] text-[var(--admin-gold-ink)]">Unsaved changes</span>
            ) : message?.kind === "saved" ? (
              <span className="text-[#067647]">{message.text}</span>
            ) : null}
          </span>
          <button className={secondaryButton} onClick={onBack} type="button">
            Close
          </button>
          <button className={primaryButton} disabled={!isDirty || saving} onClick={onSave} type="button">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
