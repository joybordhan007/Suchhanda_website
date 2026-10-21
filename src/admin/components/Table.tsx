import type { ReactNode } from "react"
import Icon, { type IconName } from "./Icon"

type Header = string | { label: string; align?: "left" | "right"; srOnly?: boolean }

type TableProps = {
  headers: Header[]
  children: ReactNode
  // Shown instead of rows when the list is empty.
  empty?: { icon: IconName; title: string; text?: string; action?: ReactNode } | false
  footer?: ReactNode
}

// Minimal list table: hairline rows, quiet header, scrolls sideways on narrow screens.
export default function Table({ headers, children, empty, footer }: TableProps) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-[var(--admin-border)]">
              {headers.map((header, index) => {
                const { label, align = "left", srOnly = false } = typeof header === "string" ? { label: header } : header
                return (
                  <th
                    className={`px-[20px] pt-[14px] pb-[10px] text-[12px] font-medium text-[var(--admin-muted)] ${align === "right" ? "text-right" : ""}`}
                    key={label || index}
                    scope="col"
                  >
                    <span className={srOnly ? "sr-only" : undefined}>{label}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="[&>tr+tr]:border-t [&>tr+tr]:border-[#f0f2f5]">{children}</tbody>
        </table>
      </div>
      {empty && (
        <div className="flex flex-col items-center gap-[8px] px-[20px] py-[48px] text-center">
          <span className="flex size-[44px] items-center justify-center rounded-full bg-[#f2f4f7] text-[var(--admin-muted)]">
            <Icon name={empty.icon} size={20} />
          </span>
          <p className="text-[15px] font-semibold text-[var(--admin-text)]">{empty.title}</p>
          {empty.text && <p className="max-w-[360px] text-[13px] text-[var(--admin-muted)]">{empty.text}</p>}
          {empty.action && <div className="mt-[8px]">{empty.action}</div>}
        </div>
      )}
      {footer && <div className="border-t border-[var(--admin-border)] px-[20px] py-[12px] text-[13px] text-[var(--admin-muted)]">{footer}</div>}
    </div>
  )
}
