import type { Review } from "../content/types"
import { mediaUrl } from "../paths"

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
    <img alt="" className="shrink-0 rounded-full object-cover" height={size} src={src} style={{ width: size, height: size }} width={size} />
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

// Review text first, then the reviewer: photo, name and star rating.
export default function ReviewCard({ review, clamp = true }: { review: Review; clamp?: boolean }) {
  return (
    <figure className="review-card flex h-full flex-col justify-between gap-[32px] rounded-[24px] border border-[#ececec] bg-white p-[32px] shadow-[0px_1px_5px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-[16px]">
        <svg aria-hidden="true" className="shrink-0" fill="#c7994b" height="28" viewBox="0 0 32 24" width="36">
          <path d="M0 24V14.4C0 6.4 4.3 1.6 12.8 0l1.4 3.2C9.4 4.6 7.2 7.3 7 11.2h6v12.8H0zm18 0V14.4C18 6.4 22.3 1.6 30.8 0l1.4 3.2c-4.8 1.4-7 4.1-7.2 8H31v12.8H18z" />
        </svg>
        <blockquote className={`font-['Inter:Regular'] text-[18px] leading-[1.5] text-[#3e3e3e] whitespace-pre-line [word-break:break-word] ${clamp ? "line-clamp-6" : ""}`}>
          {review.text}
        </blockquote>
      </div>
      <figcaption className="flex items-center gap-[16px] border-t border-[#f0f0f0] pt-[24px]">
        <ReviewAvatar image={review.image} name={review.name} />
        <span className="flex min-w-0 flex-col gap-[6px]">
          <span className="truncate font-['Inter:Semi_Bold'] text-[18px] font-semibold leading-[1.2] text-[#191919]">{review.name}</span>
          <Stars rating={review.rating} />
        </span>
      </figcaption>
    </figure>
  )
}
