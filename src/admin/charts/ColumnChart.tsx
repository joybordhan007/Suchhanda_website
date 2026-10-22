import { useState } from "react"
import { columnPath, compact, niceTicks, useWidth } from "./chartUtils"

type ColumnChartProps = {
  labels: string[]
  values: number[]
  color: string
  valueLabel: string
  height?: number
}

const MARGIN = { top: 22, right: 8, bottom: 28, left: 32 }

// Magnitude per period, one series. Each column is its own hover/focus target.
export default function ColumnChart({ labels, values, color, valueLabel, height = 220 }: ColumnChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
  const plotHeight = height - MARGIN.top - MARGIN.bottom
  const ticks = niceTicks(Math.max(0, ...values), 3)
  const top = ticks[ticks.length - 1]
  const band = values.length ? plotWidth / values.length : 0
  const barWidth = Math.max(2, Math.min(24, band - 2, band * 0.62))
  const y = (value: number) => MARGIN.top + plotHeight - (value / top) * plotHeight
  const peak = values.indexOf(Math.max(...values))
  const labelEvery = Math.max(1, Math.ceil(values.length / Math.max(2, Math.floor(plotWidth / 64))))

  return (
    <div className="relative w-full" ref={ref} style={{ height }}>
      {width > 0 && (
        <svg aria-label={`${valueLabel} chart`} className="block" height={height} role="group" width={width}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line stroke={tick === 0 ? "var(--chart-axis)" : "var(--chart-grid)"} x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={y(tick)} y2={y(tick)} />
              <text className="fill-[var(--chart-muted)] text-[11px] [font-variant-numeric:tabular-nums]" dominantBaseline="middle" textAnchor="end" x={MARGIN.left - 8} y={y(tick)}>
                {compact(tick)}
              </text>
            </g>
          ))}
          {values.map((value, index) => {
            const x = MARGIN.left + index * band + (band - barWidth) / 2
            const barY = y(value)
            return (
              <g
                aria-label={`${labels[index]}: ${value} ${valueLabel}`}
                className="cursor-default outline-none"
                key={labels[index]}
                onBlur={() => setActive(null)}
                onFocus={() => setActive(index)}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                role="img"
                tabIndex={0}
              >
                {/* Hit target: the whole band, not just the painted column. */}
                <rect fill="transparent" height={plotHeight} width={band} x={MARGIN.left + index * band} y={MARGIN.top} />
                <path d={columnPath(x, barY, barWidth, MARGIN.top + plotHeight - barY)} fill={color} opacity={active === null || active === index ? 1 : 0.55} />
                {index === peak && value > 0 && active === null && (
                  <text className="fill-[var(--admin-text-2)] text-[12px] font-semibold" textAnchor="middle" x={x + barWidth / 2} y={barY - 6}>
                    {value}
                  </text>
                )}
                {(index % labelEvery === 0 || index === values.length - 1) && (index === values.length - 1 || values.length - 1 - index >= labelEvery) && (
                  <text
                    className="fill-[var(--chart-muted)] text-[11px]"
                    // Keep edge labels inside the chart instead of clipping them.
                    textAnchor={index === values.length - 1 ? "end" : index === 0 ? "start" : "middle"}
                    x={index === values.length - 1 ? x + barWidth : index === 0 ? x : x + barWidth / 2}
                    y={height - 8}
                  >
                    {labels[index]}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
      {active !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-[4px] border border-[var(--admin-border)] bg-white/95 px-[12px] py-[8px] shadow-[0_8px_24px_rgb(16_24_40/12%)]"
          style={{ left: Math.min(Math.max(MARGIN.left + active * band + band / 2 - 70, 0), Math.max(0, width - 140)) }}
        >
          <p className="text-[12px] text-[var(--admin-muted)]">{labels[active]}</p>
          <p className="text-[12px] text-[var(--admin-text-2)]">
            <span className="text-[14px] font-semibold text-[var(--admin-text)]">{values[active]}</span> {valueLabel}
          </p>
        </div>
      )}
    </div>
  )
}
