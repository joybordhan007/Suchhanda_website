import { useState } from "react"
import CtaBanner from "../components/CtaBanner"
import Footer from "../components/Footer"
import { Lines } from "../components/HeroText"
import HighlightText from "../components/HighlightText"
import ReviewCard, { Stars } from "../components/ReviewCard"
import ReviewModal from "../components/ReviewModal"
import { fontStyle } from "../content/fonts"
import { useApprovedReviews } from "../content/reviews"
import { useSiteContent } from "../content/store"

// Same layout as the Blog page, so it shares the Blog hero's node ids (and their mobile styles).
// Every approved review, newest first, and the "Add Review" popup for visitors.
export default function Reviews() {
  const hero = useSiteContent().heroes.reviews
  const { reviews, loaded } = useApprovedReviews()
  const [adding, setAdding] = useState(false)
  const rows = Array.from({ length: Math.ceil(reviews.length / 3) }, (_, index) => reviews.slice(index * 3, index * 3 + 3))
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="flow-page bg-[#fefefe] relative w-full" data-name="Reviews">
      <div className="reviews-hero relative h-[560px] overflow-clip w-[1920px]" data-name="Hero" data-node-id="1:1584">
        <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[32px] items-center left-[410px] text-[#091e39] top-[208px] w-[1100px]" data-name="Frame" data-node-id="1:1585">
          <p className="font-['Noto_Serif:Bold'] font-bold leading-[0] relative shrink-0 text-[64px] text-center" data-node-id="1:1586" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100', ...fontStyle(hero.titleFont) }}>
            <HighlightText text={hero.title} />
          </p>
          <p className="font-['Anuphan:Regular'] font-normal leading-[1.3] relative shrink-0 text-[32px] text-center w-full" data-node-id="1:1587" style={fontStyle(hero.descriptionFont)}>
            <Lines text={hero.description} />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-[24px]">
            <button
              aria-expanded={adding}
              aria-haspopup="dialog"
              className="reviews-add bg-[#091e39] flex items-center justify-center gap-[8px] px-[28px] py-[16.5px] rounded-[999px] font-['Inter:Medium'] font-medium leading-[1.2] text-[16px] text-white transition-colors hover:bg-[#c7994b]"
              onClick={() => setAdding(true)}
              type="button"
            >
              <span aria-hidden="true" className="text-[20px] leading-[0.8]">
                +
              </span>
              Add Review
            </button>
            {reviews.length > 0 && (
              <span className="flex items-center gap-[10px] font-['Inter:Regular'] text-[16px] text-[#3e3e3e]">
                <Stars rating={Math.round(average)} size={20} />
                <span>
                  <span className="font-['Inter:Semi_Bold'] font-semibold text-[#191919]">{average.toFixed(1)}</span> from {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto flex flex-col gap-[24px] items-start w-[1280px]" data-name="Frame">
        {loaded && reviews.length === 0 && (
          <p className="w-full rounded-[24px] border border-dashed border-[#d9d9d9] px-[32px] py-[56px] text-center font-['Inter:Regular'] text-[18px] text-[#3e3e3e]">
            No reviews yet. Be the first to share your experience.
          </p>
        )}
        {rows.map((row, index) => (
          <div className="reviews-grid grid w-full grid-cols-3 items-stretch gap-[24px]" key={index}>
            {row.map((review) => (
              <ReviewCard clamp={false} key={review.id} review={review} />
            ))}
          </div>
        ))}
      </div>
      <CtaBanner className="mx-auto mt-[120px]" nodeId="1:1736" />
      <div className="mt-[120px]">
        <Footer />
      </div>
      {adding && <ReviewModal onClose={() => setAdding(false)} />}
    </div>
  )
}
