import { useState, type ReactNode } from "react"
import Icon from "../components/Icon"

export type LegendItem = { label: string; color: string; shape?: "line" | "rect" }

type ChartCardProps = {
  title: string
  subtitle?: string
  legend?: LegendItem[]
  // The same data as a table: the accessible twin of the chart.
  table: { headers: string[]; rows: (string | number)[][] }
  children: ReactNode
  className?: string
}

export default function ChartCard({ title, subtitle, legend, table, children, className = "" }: ChartCardProps) {
  const [view, setView] = useState<"chart" | "table">("chart")

  return (
    <figure className={`admin-card flex min-w-0 flex-col gap-[16px] p-[20px] ${className}`}>
      <figcaption className="flex flex-wrap items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold text-[var(--admin-text)]">{title}</h2>
          {subtitle && <p className="mt-[2px] text-[13px] text-[var(--admin-muted)]">{subtitle}</p>}
        </div>
        <div aria-label="Show as" className="flex rounded-[9px] border border-[var(--admin-border)] bg-[#f9fafb] p-[2px]" role="group">
          {(["chart", "table"] as const).map((option) => (
            <button
              aria-label={option === "chart" ? "Show chart" : "Show table"}
              aria-pressed={view === option}
              className={`flex h-[28px] w-[32px] items-center justify-center rounded-[7px] transition ${
                view === option ? "bg-white text-[var(--admin-text)] shadow-[0_1px_2px_rgb(16_24_40/10%)]" : "text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
              }`}
              key={option}
              onClick={() => setView(option)}
              title={option === "chart" ? "Chart" : "Table"}
              type="button"
            >
              <Icon name={option === "chart" ? "chart" : "table"} size={15} />
            </button>
          ))}
        </div>
      </figcaption>

      {legend && legend.length > 1 && view === "chart" && (
        <ul className="-mt-[6px] flex flex-wrap gap-x-[16px] gap-y-[4px] text-[13px] text-[var(--admin-text-2)]">
          {legend.map((item) => (
            <li className="flex items-center gap-[6px]" key={item.label}>
              <span
                aria-hidden="true"
                className={item.shape === "rect" ? "size-[10px] rounded-[3px]" : "h-[2px] w-[14px] rounded-full"}
                style={{ background: item.color }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      )}

      {view === "chart" ? (
        children
      ) : (
        <div className="max-h-[300px] overflow-auto rounded-[10px] border border-[var(--admin-border)]">
          <table className="w-full border-collapse text-left text-[13px] [font-variant-numeric:tabular-nums]">
            <thead className="sticky top-0 border-b border-[var(--admin-border)] bg-white text-[12px] text-[var(--admin-muted)]">
              <tr>
                {table.headers.map((header, index) => (
                  <th className={`px-[12px] py-[8px] font-semibold ${index > 0 ? "text-right" : ""}`} key={header} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((value, index) => (
                    <td className={`px-[12px] py-[7px] ${index > 0 ? "text-right" : ""}`} key={index}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  )
}
