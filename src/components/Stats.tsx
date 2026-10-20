import { useEffect, useRef, useState } from "react"
import { useSiteContent } from "../content/store"

function AnimatedValue({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const element = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = element.current
    if (!node) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setCount(value)
      return
    }

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const startedAt = performance.now()
        const duration = 1400

        const animate = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1)
          setCount(Math.round(value * (1 - (1 - progress) ** 4)))
          if (progress < 1) frame = requestAnimationFrame(animate)
        }

        frame = requestAnimationFrame(animate)
      },
      { threshold: 0.45 },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <span ref={element} aria-label={`${value}${suffix}`}>
      {count}
      {suffix}
    </span>
  )
}

export default function Stats({ className }: { className: string }) {
  const { stats } = useSiteContent()
  return (
    <div
      className={`achievement-stats ${className}`}
      aria-label="Achievements"
    >
      {stats.map(({ id, value, suffix, label }) => (
        <div
          className="achievement-card"
          key={id}
        >
          <div className="achievement-value">
            <AnimatedValue value={value} suffix={suffix} />
          </div>
          <div className="achievement-label">
            <p>{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
