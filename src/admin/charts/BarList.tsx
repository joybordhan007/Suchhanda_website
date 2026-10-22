type BarListProps = {
  items: { label: string; value: number }[]
  color: string
  valueLabel: string
  empty: string
}

// Ranked rows: label with value and share on one line, a bar on a light track below.
export default function BarList({ items, color, valueLabel, empty }: BarListProps) {
  if (items.length === 0) {
    return <p className="flex min-h-[160px] items-center justify-center rounded-[4px] bg-[#f9fafb] px-[16px] text-center text-[13px] text-[var(--admin-muted)]">{empty}</p>
  }
  const max = Math.max(...items.map((item) => item.value), 1)
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1
  return (
    <ol className="flex flex-col gap-[14px]">
      {items.map((item, index) => (
        <li className="group flex flex-col gap-[6px]" key={item.label} title={`${item.label}: ${item.value} ${valueLabel}`}>
          <span className="flex items-center gap-[10px] text-[13px]">
            <span className="w-[16px] shrink-0 text-[12px] font-semibold text-[var(--admin-muted)] [font-variant-numeric:tabular-nums]">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-[var(--admin-text)]">{item.label}</span>
            <span className="shrink-0 font-semibold text-[var(--admin-text)] [font-variant-numeric:tabular-nums]">{item.value}</span>
            <span className="w-[40px] shrink-0 text-right text-[12px] text-[var(--admin-muted)] [font-variant-numeric:tabular-nums]">
              {Math.round((item.value / total) * 100)}%
            </span>
          </span>
          <span className="ml-[26px] h-[6px] overflow-hidden rounded-[4px] bg-[#f2f4f7]">
            <span
              className="block h-full rounded-[4px] transition-opacity group-hover:opacity-80"
              style={{ width: `max(4px, ${(item.value / max) * 100}%)`, background: color }}
            />
          </span>
        </li>
      ))}
    </ol>
  )
}
