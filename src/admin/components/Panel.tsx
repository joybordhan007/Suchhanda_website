import type { ReactNode } from "react"

type PanelProps = {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export default function Panel({ title, description, children, className = "" }: PanelProps) {
  return (
    <section className={`admin-card flex flex-col gap-[20px] p-[20px] sm:p-[24px] ${className}`}>
      {(title || description) && (
        <div className="flex flex-col gap-[4px]">
          {title && <h2 className="text-[16px] font-semibold text-[var(--admin-text)]">{title}</h2>}
          {description && <p className="text-[14px] leading-[1.5] text-[var(--admin-muted)]">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
