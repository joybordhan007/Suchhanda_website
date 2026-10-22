import type { ReactNode } from "react"

type SectionHeaderProps = {
  title: string
  description: string
  // Shown when a section is editable but not yet displayed on the public site.
  notice?: string
  // Buttons shown on the right, level with the title.
  actions?: ReactNode
}

export default function SectionHeader({ title, description, notice, actions }: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-[6px]">
      <div className="flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[10px]">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--admin-text)]">{title}</h1>
        {actions && <div className="flex flex-wrap items-center gap-[10px]">{actions}</div>}
      </div>
      <p className="max-w-[720px] text-[15px] leading-[1.5] text-[var(--admin-muted)]">{description}</p>
      {notice && (
        <p className="mt-[6px] max-w-[720px] rounded-[4px] border border-[#f3dfb6] bg-[#fdf8ee] px-[14px] py-[10px] text-[14px] text-[#7a5b22]">
          {notice}
        </p>
      )}
    </header>
  )
}
