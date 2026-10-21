import { useLayoutEffect, useRef, useState } from "react"

// Width of an element, kept up to date as it resizes.
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    observer.observe(element)
    setWidth(Math.floor(element.getBoundingClientRect().width))
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

// Clean axis ticks from 0 to just above `max` (always at least 1..4).
export function niceTicks(max: number, count = 4) {
  const safeMax = Math.max(max, count)
  const rough = safeMax / count
  const power = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= rough) ?? rough
  const top = Math.ceil(safeMax / step) * step
  const ticks: number[] = []
  for (let value = 0; value <= top + step / 2; value += step) ticks.push(Math.round(value * 100) / 100)
  return ticks
}

export function compact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`
  return String(value)
}

export function shortDate(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

// Column path with a 4px rounded data-end and a square base.
export function columnPath(x: number, y: number, width: number, height: number, radius = 4) {
  if (height <= 0) return ""
  const r = Math.min(radius, width / 2, height)
  return `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`
}
