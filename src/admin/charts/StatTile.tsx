import Icon, { type IconName } from "../components/Icon"

type StatTileProps = {
  label: string
  value: string
  icon: IconName
  // Change against the previous period, as a fraction (0.12 = +12%). null = no comparison.
  delta: number | null
  periodLabel: string
  trend?: number[]
  accent: string
}

function Sparkline({ values, accent }: { values: number[]; accent: string }) {
  if (values.length < 2) return null
  const width = 96
  const height = 32
  const max = Math.max(...values, 1)
  const point = (value: number, index: number) => [(index / (values.length - 1)) * (width - 6) + 3, height - 4 - (value / max) * (height - 8)] as const
  const points = values.map(point)
  const [lastX, lastY] = points[points.length - 1]
  return (
    <svg aria-hidden="true" className="shrink-0" height={height} width={width}>
      <polyline fill="none" points={points.map(([x, y]) => `${x},${y}`).join(" ")} stroke="var(--chart-muted)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      <circle cx={lastX} cy={lastY} fill={accent} r={3.5} stroke="#fff" strokeWidth={1.5} />
    </svg>
  )
}

// Headline number with its change and a small trend line.
export default function StatTile({ label, value, icon, delta, periodLabel, trend, accent }: StatTileProps) {
  const up = delta !== null && delta > 0
  const down = delta !== null && delta < 0
  return (
    <div className="admin-card flex flex-col gap-[14px] p-[18px]">
      <div className="flex items-center justify-between gap-[8px]">
        <span className="text-[13px] font-medium text-[var(--admin-muted)]">{label}</span>
        <span className="flex size-[32px] items-center justify-center rounded-[9px] bg-[#f4f5f7] text-[var(--admin-text-2)]">
          <Icon name={icon} size={16} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-[8px]">
        <div className="min-w-0">
          <p className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[var(--admin-text)]">{value}</p>
          <p className="mt-[8px] flex flex-wrap items-center gap-[6px] text-[12px] text-[var(--admin-muted)]">
            {delta === null ? (
              <span>No earlier data</span>
            ) : (
              <span
                className={`admin-badge ${up ? "bg-[#ecfdf3] text-[#067647]" : down ? "bg-[#fef3f2] text-[#b42318]" : "bg-[#f2f4f7] text-[#475467]"}`}
              >
                <span aria-hidden="true">{up ? "↑" : down ? "↓" : "→"}</span>
                {Math.abs(Math.round(delta * 100))}%
              </span>
            )}
            <span>{periodLabel}</span>
          </p>
        </div>
        {trend && <Sparkline accent={accent} values={trend} />}
      </div>
    </div>
  )
}
