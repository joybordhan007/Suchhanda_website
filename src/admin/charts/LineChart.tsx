import { useState, type KeyboardEvent, type PointerEvent } from "react"
import { compact, niceTicks, shortDate, useWidth } from "./chartUtils"

export type LineSeries = { key: string; label: string; color: string; values: number[] }

type LineChartProps = {
  days: string[]
  series: LineSeries[]
  height?: number
}

const MARGIN = { top: 12, right: 40, bottom: 28, left: 36 }

// Trend over time. A crosshair follows the pointer (or arrow keys) and the tooltip
// lists every series at that day.
export default function LineChart({ days, series, height = 260 }: LineChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
  const plotHeight = height - MARGIN.top - MARGIN.bottom
  const ticks = niceTicks(Math.max(0, ...series.flatMap((item) => item.values)))
  const top = ticks[ticks.length - 1]
  const x = (index: number) => MARGIN.left + (days.length <= 1 ? plotWidth / 2 : (index / (days.length - 1)) * plotWidth)
  const y = (value: number) => MARGIN.top + plotHeight - (value / top) * plotHeight
  const labelEvery = Math.max(1, Math.ceil(days.length / Math.max(2, Math.floor(plotWidth / 76))))
  const last = days.length - 1

  // Value labels at the line ends, unless they would sit on top of each other.
  const endYs = series.map((item) => y(item.values[last] ?? 0))
  const endLabelsFit = endYs.every((value, index) => endYs.every((other, otherIndex) => otherIndex === index || Math.abs(value - other) >= 14))

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const position = event.clientX - bounds.left - MARGIN.left
    setActive(Math.min(last, Math.max(0, Math.round((position / Math.max(1, plotWidth)) * last))))
  }

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") setActive((index) => Math.max(0, (index ?? last) - 1))
    else if (event.key === "ArrowRight") setActive((index) => Math.min(last, (index ?? 0) + 1))
    else return
    event.preventDefault()
  }

  const tooltipLeft = active === null ? 0 : Math.min(Math.max(x(active) - 80, 0), Math.max(0, width - 168))

  return (
    <div
      aria-label="Chart: use the left and right arrow keys to read each day"
      className="relative w-full rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-gold)]"
      onBlur={() => setActive(null)}
      onFocus={() => setActive(last)}
      onKeyDown={onKey}
      ref={ref}
      role="img"
      style={{ height }}
      tabIndex={0}
    >
      {width > 0 && (
        <svg className="block" height={height} onPointerLeave={() => setActive(null)} onPointerMove={pick} width={width}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line stroke={tick === 0 ? "var(--chart-axis)" : "var(--chart-grid)"} x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={y(tick)} y2={y(tick)} />
              <text className="fill-[var(--chart-muted)] text-[11px] [font-variant-numeric:tabular-nums]" dominantBaseline="middle" textAnchor="end" x={MARGIN.left - 8} y={y(tick)}>
                {compact(tick)}
              </text>
            </g>
          ))}
          {days.map((day, index) =>
            index % labelEvery === 0 || index === last ? (
              index === last || last - index >= labelEvery * 0.6 ? (
                <text className="fill-[var(--chart-muted)] text-[11px]" key={day} textAnchor="middle" x={x(index)} y={height - 8}>
                  {shortDate(day)}
                </text>
              ) : null
            ) : null,
          )}
          {active !== null && <line stroke="var(--chart-axis)" x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />}
          {series.map((item) => (
            <polyline
              fill="none"
              key={item.key}
              points={item.values.map((value, index) => `${x(index)},${y(value)}`).join(" ")}
              stroke={item.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          ))}
          {series.map((item) => {
            const index = active ?? last
            return <circle cx={x(index)} cy={y(item.values[index] ?? 0)} fill={item.color} key={item.key} r={4} stroke="#fff" strokeWidth={2} />
          })}
          {active === null &&
            endLabelsFit &&
            series.map((item, index) => (
              <text className="fill-[var(--admin-text-2)] text-[12px] font-semibold" dominantBaseline="middle" key={item.key} x={x(last) + 9} y={endYs[index]}>
                {compact(item.values[last] ?? 0)}
              </text>
            ))}
        </svg>
      )}
      {active !== null && (
        <div
          className="pointer-events-none absolute top-[4px] z-10 w-[168px] rounded-[10px] border border-[var(--admin-border)] bg-white/95 px-[12px] py-[10px] shadow-[0_8px_24px_rgb(16_24_40/12%)] backdrop-blur"
          style={{ left: tooltipLeft }}
        >
          <p className="mb-[6px] text-[12px] text-[var(--admin-muted)]">{shortDate(days[active])}</p>
          {series.map((item) => (
            <p className="flex items-center gap-[8px] text-[12px] text-[var(--admin-text-2)]" key={item.key}>
              <span aria-hidden="true" className="h-[2px] w-[12px] rounded-full" style={{ background: item.color }} />
              <span className="text-[14px] font-semibold text-[var(--admin-text)]">{item.values[active] ?? 0}</span>
              {item.label}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
