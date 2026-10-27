import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { Review } from "../content/types"
import { mediaUrl } from "../paths"
import { useSiteText } from "./Txt"

export function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className="flex items-center gap-[2px]" role="img">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg aria-hidden="true" fill={star <= rating ? "#facc15" : "#e5e7eb"} height={size} key={star} viewBox="0 0 20 20" width={size}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  )
}

// Photo, or the first letter of the name when the reviewer sent none.
export function ReviewAvatar({ name, image, size = 56 }: { name: string; image: string; size?: number }) {
  const src = mediaUrl(image)
  return src ? (
    <img decoding="async" loading="lazy" alt="" className="shrink-0 rounded-full object-cover" height={size} src={src} style={{ width: size, height: size }} width={size} />
  ) : (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-[#091e39] font-['Inter:Semi_Bold'] font-semibold text-[#e9c98f]"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  )
}

function Reviewer({ review }: { review: Review }) {
  const text = useSiteText()
  return (
    <figcaption className="flex items-center gap-[12px]">
      <ReviewAvatar image={review.image} name={review.name} size={50} />
      <span className="flex min-w-0 flex-col gap-[4px]">
        <span className="truncate font-['Inter:Semi_Bold'] text-[18px] font-semibold leading-[1.2] text-[#191919]" style={text("sections.reviewName").style}>
          {review.name}
        </span>
        {review.role && (
          <span className="truncate font-['Inter:Regular'] text-[16px] leading-[1.2] text-[#555]" style={text("sections.reviewRole").style}>
            {review.role}
          </span>
        )}
      </span>
    </figcaption>
  )
}

function CardTop({ review, starSize }: { review: Review; starSize: number }) {
  const text = useSiteText()
  return (
    <div className="flex items-center justify-between gap-[16px]">
      <span className="min-w-0 truncate font-['Inter:Regular'] text-[18px] leading-[1.2] text-[#3e3e3e]" style={text("sections.reviewCompany").style}>
        {review.company}
      </span>
      <Stars rating={review.rating} size={starSize} />
    </div>
  )
}

// The whole review in a popup, opened from "See more". Rendered on <body>, outside the
// scaled design canvas, so it keeps its real size.
function FullReview({ review, onClose }: { review: Review; onClose: () => void }) {
  const text = useSiteText()
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#091e39]/55 p-[16px] backdrop-blur-[2px]" onClick={onClose}>
      <figure
        aria-label={`Review from ${review.name}`}
        aria-modal="true"
        className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[560px] flex-col gap-[20px] overflow-y-auto rounded-[6px] bg-white p-[28px] shadow-[0_24px_64px_rgba(9,30,57,0.28)] sm:p-[36px]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="Close"
          autoFocus
          className="absolute top-[10px] right-[10px] flex size-[36px] items-center justify-center rounded-full text-[#667085] transition hover:bg-[#f5f5f5] hover:text-[#191919]"
          onClick={onClose}
          type="button"
        >
          <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="pr-[36px]">
          <CardTop review={review} starSize={20} />
        </div>
        <blockquote className="font-['Inter:Regular'] text-[17px] leading-[1.6] text-[#191919] whitespace-pre-line [word-break:break-word]" style={text("sections.reviewText").style}>
          “{review.text}”
        </blockquote>
        <Reviewer review={review} />
      </figure>
    </div>,
    document.body,
  )
}

// Company and stars on top, the review in quotes, then the reviewer: photo, name, role.
// Cards are 380px tall; a review too long to fit gets "See more", which opens it whole.
export default function ReviewCard({ review }: { review: Review }) {
  const text = useSiteText()
  const quote = useRef<HTMLQuoteElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [open, setOpen] = useState(false)

  useLayoutEffect(() => {
    const element = quote.current
    if (!element) return
    const measure = () => setOverflows(element.scrollHeight > element.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [review.text])

  return (
    <figure className="review-card flex h-[380px] flex-col gap-[24px] rounded-[6px] border border-[#ededed] bg-white p-[36px] shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
      <CardTop review={review} starSize={24} />
      <div className="flex min-h-0 flex-1 flex-col items-start gap-[8px]">
        <blockquote
          className="line-clamp-5 font-['Inter:Regular'] text-[1.125rem] leading-[1.5] text-[#191919] whitespace-pre-line [word-break:break-word]"
          ref={quote}
          style={text("sections.reviewText").style}
        >
          “{review.text}”
        </blockquote>
        {overflows && (
          <button
            aria-expanded={open}
            aria-haspopup="dialog"
            className="font-['Inter:Semi_Bold'] text-[16px] font-semibold leading-[1.2] text-[#c7994b] underline-offset-4 hover:underline"
            onClick={() => setOpen(true)}
            type="button"
          >
            See more
          </button>
        )}
      </div>
      <Reviewer review={review} />
      {open && <FullReview onClose={() => setOpen(false)} review={review} />}
    </figure>
  )
}
