import { useId } from "react"
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

// Recent trend as a soft area under a 2px line, ending in a marker on the latest value.
function Sparkline({ values, accent }: { values: number[]; accent: string }) {
  const gradientId = useId()
  if (values.length < 2) return null
  const width = 112
  const height = 40
  const max = Math.max(...values, 1)
  const points = values.map((value, index) => [(index / (values.length - 1)) * (width - 8) + 4, height - 5 - (value / max) * (height - 12)] as const)
  const line = points.map(([x, y]) => `${x},${y}`).join(" ")
  const [lastX, lastY] = points[points.length - 1]
  return (
    <svg aria-hidden="true" className="shrink-0" height={height} width={width}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={0.22} />
          <stop offset="100%" stopColor={accent} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradientId})`} points={`${points[0][0]},${height} ${line} ${lastX},${height}`} />
      <polyline fill="none" points={line} stroke={accent} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      <circle cx={lastX} cy={lastY} fill={accent} r={4} stroke="#fff" strokeWidth={2} />
    </svg>
  )
}

// Headline number with its change and a small trend line. The accent bar and icon carry
// the series color; the text stays in ink colors.
export default function StatTile({ label, value, icon, delta, periodLabel, trend, accent }: StatTileProps) {
  const up = delta !== null && delta > 0
  const down = delta !== null && delta < 0
  return (
    <div className="admin-card relative flex flex-col gap-[16px] overflow-hidden p-[20px]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />
      <div className="flex items-center gap-[10px]">
        <span
          className="flex size-[32px] items-center justify-center rounded-[4px]"
          style={{ background: `color-mix(in srgb, ${accent} 12%, white)`, color: accent }}
        >
          <Icon name={icon} size={16} />
        </span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--admin-muted)]">{label}</span>
      </div>
      <div className="flex min-h-[40px] items-end justify-between gap-[8px]">
        <p className="text-[32px] font-semibold leading-none tracking-[-0.03em] text-[var(--admin-text)] [font-variant-numeric:tabular-nums]">{value}</p>
        {trend && <Sparkline accent={accent} values={trend} />}
      </div>
      <p className="-mt-[4px] flex flex-wrap items-center gap-[6px] border-t border-[var(--admin-border)] pt-[12px] text-[12px] text-[var(--admin-muted)]">
        {delta === null ? (
          <span>No earlier data to compare</span>
        ) : (
          <>
            <span
              className={`admin-badge ${up ? "bg-[#ecfdf3] text-[#067647]" : down ? "bg-[#fef3f2] text-[#b42318]" : "bg-[#f2f4f7] text-[#475467]"}`}
            >
              <span aria-hidden="true">{up ? "↑" : down ? "↓" : "→"}</span>
              {Math.abs(Math.round(delta * 100))}%
            </span>
            <span>{periodLabel}</span>
          </>
        )}
      </p>
    </div>
  )
}
