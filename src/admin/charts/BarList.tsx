type BarListProps = {
  items: { label: string; value: number }[]
  color: string
  valueLabel: string
  empty: string
}

// Ranked horizontal bars: label above, bar with the value at its tip.
export default function BarList({ items, color, valueLabel, empty }: BarListProps) {
  if (items.length === 0) {
    return <p className="flex min-h-[160px] items-center justify-center rounded-[10px] bg-[#f9fafb] px-[16px] text-center text-[13px] text-[var(--admin-muted)]">{empty}</p>
  }
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <ul className="flex flex-col gap-[12px]">
      {items.map((item) => (
        <li className="group flex flex-col gap-[5px]" key={item.label} title={`${item.label}: ${item.value} ${valueLabel}`}>
          <span className="truncate text-[13px] text-[var(--admin-text-2)]">{item.label}</span>
          <span className="flex items-center gap-[8px]">
            <span
              className="h-[10px] rounded-r-[4px] transition-opacity group-hover:opacity-80"
              style={{ width: `max(4px, calc((100% - 44px) * ${item.value / max}))`, background: color }}
            />
            <span className="text-[13px] font-semibold text-[var(--admin-text)] [font-variant-numeric:tabular-nums]">{item.value}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
