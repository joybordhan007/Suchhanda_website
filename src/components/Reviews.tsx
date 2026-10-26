import type { CSSProperties } from "react"
import { useApprovedReviews } from "../content/reviews"
import ReviewCard from "./ReviewCard"
import Txt from "./Txt"

// Enough cards in one loop to fill a wide screen, and seconds each card takes to pass.
const MIN_PER_LOOP = 4
const SECONDS_PER_CARD = 7

// "Trusted by Businesses Proven by Results": approved reviews gliding sideways in an
// endless loop (paused on hover), and a button to the Reviews page.
export default function Reviews() {
  const { reviews, loaded } = useApprovedReviews()
  const latest = reviews.slice(0, 12)
  // Repeat short lists so one loop is wider than the screen; the loop is then drawn twice
  // and moved by exactly one loop's width, so the seam never shows.
  const loop = latest.length ? Array.from({ length: Math.ceil(MIN_PER_LOOP / latest.length) }, () => latest).flat() : []

  return (
    <div className="reviews flex w-full flex-col items-center gap-[40px]">
      {loop.length > 0 ? (
        <div aria-label="Client reviews" className="reviews-marquee w-full" role="region">
          <div className="reviews-marquee-track" style={{ "--reviews-duration": `${loop.length * SECONDS_PER_CARD}s` } as CSSProperties}>
            {[0, 1].map((copy) =>
              loop.map((review, index) => (
                <div aria-hidden={copy === 1 || index >= latest.length ? true : undefined} className="reviews-marquee-item" key={`${copy}-${index}`}>
                  <ReviewCard review={review} />
                </div>
              )),
            )}
          </div>
        </div>
      ) : (
        loaded && (
          <p className="w-full rounded-[24px] border border-dashed border-[#d9d9d9] px-[32px] py-[48px] text-center font-['Inter:Regular'] text-[18px] text-[#3e3e3e]">
            <Txt className="leading-[1.5]" k="sections.reviewsEmpty" />
          </p>
        )
      )}
      <div
        className="bg-[#091e39] content-stretch flex items-center justify-center px-[20px] py-[16.5px] relative rounded-[999px] shrink-0 w-[176px]"
        data-name="CTA"
        data-path="/reviews"
      >
        <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.2] not-italic relative shrink-0 text-center text-[16px] text-white whitespace-nowrap">
          <Txt k={latest.length > 0 ? "sections.reviewsButton" : "sections.reviewsEmptyButton"} />
        </p>
      </div>
    </div>
  )
}
