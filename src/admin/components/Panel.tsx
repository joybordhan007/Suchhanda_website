import type { ReactNode } from "react"

type PanelProps = {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export default function Panel({ title, description, children, className = "" }: PanelProps) {
  return (
    <section
      className={`flex flex-col gap-[20px] rounded-[12px] bg-white p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-[24px] ${className}`}
    >
      {(title || description) && (
        <div className="flex flex-col gap-[4px]">
          {title && <h2 className="text-[18px] font-semibold text-[#191919]">{title}</h2>}
          {description && <p className="text-[14px] text-[#666]">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
