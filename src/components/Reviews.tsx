import { useState } from "react"
import { useSiteContent } from "../content/store"
import { mediaUrl } from "../paths"

const PER_PAGE = 3

// "Trusted by Businesses Proven by Results": review screenshots, three at a time,
// with page dots when there are more than three.
export default function Reviews() {
  const { reviews } = useSiteContent()
  const [page, setPage] = useState(0)
  const pages = Math.ceil(reviews.length / PER_PAGE)
  const current = Math.min(page, Math.max(0, pages - 1))
  if (reviews.length === 0) return null

  return (
    <div className="reviews flex w-full flex-col items-center gap-[40px]">
      <div className="reviews-window w-full overflow-hidden">
        <div className="reviews-track" style={{ transform: `translateX(calc(${-current} * (100% + 24px)))` }}>
          {reviews.map((review) => (
            <div className="reviews-item" key={review.id}>
              <img alt={review.name} src={mediaUrl(review.image)} />
            </div>
          ))}
        </div>
      </div>
      {pages > 1 && (
        <div aria-label="Review pages" className="reviews-dots flex items-center gap-[4px]" role="tablist">
          {Array.from({ length: pages }, (_, index) => (
            <button
              aria-label={`Show reviews page ${index + 1}`}
              aria-selected={index === current}
              className={`h-[12px] rounded-[999px] transition-all ${
                index === current ? "w-[24px] bg-[#facc15]" : "w-[12px] bg-[#fff9df]"
              }`}
              key={index}
              onClick={() => setPage(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}
