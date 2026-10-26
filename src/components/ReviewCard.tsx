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

// Company and stars on top, the review in quotes, then the reviewer: photo, name, role.
export default function ReviewCard({ review, clamp = true }: { review: Review; clamp?: boolean }) {
  const text = useSiteText()
  return (
    <figure className="review-card flex h-full flex-col gap-[24px] rounded-[6px] border border-[#ededed] bg-white p-[36px] shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-[16px]">
        <span className="min-w-0 truncate font-['Inter:Regular'] text-[18px] leading-[1.2] text-[#3e3e3e]" style={text("sections.reviewCompany").style}>
          {review.company}
        </span>
        <Stars rating={review.rating} size={24} />
      </div>
      <blockquote
        className={`flex-1 font-['Inter:Regular'] text-[22px] leading-[1.4] text-[#191919] whitespace-pre-line [word-break:break-word] ${clamp ? "line-clamp-4" : ""}`}
        style={text("sections.reviewText").style}
      >
        “{review.text}”
      </blockquote>
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
    </figure>
  )
}
