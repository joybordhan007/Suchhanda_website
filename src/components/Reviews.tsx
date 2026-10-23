import { useApprovedReviews } from "../content/reviews"
import ReviewCard from "./ReviewCard"
import Txt from "./Txt"

const SHOWN = 3

// "Trusted by Businesses Proven by Results": the three newest approved reviews and a
// button to the Reviews page, where visitors can read them all and add their own.
export default function Reviews() {
  const { reviews, loaded } = useApprovedReviews()
  const latest = reviews.slice(0, SHOWN)

  return (
    <div className="reviews flex w-full flex-col items-center gap-[40px]">
      {latest.length > 0 ? (
        <div className="reviews-grid grid w-full grid-cols-3 items-stretch gap-[24px]">
          {latest.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
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
        <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.2] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
          <Txt k={latest.length > 0 ? "sections.reviewsButton" : "sections.reviewsEmptyButton"} />
        </p>
      </div>
    </div>
  )
}
