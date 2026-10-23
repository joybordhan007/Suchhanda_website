import { asset } from "../paths"
import Txt from "./Txt"

// "Ready to Elevate Your Brand?" band shown above the footer. `nodeId` keeps the
// page-specific mobile styles in index.css working.
export default function CtaBanner({ className = "", nodeId }: { className?: string; nodeId: string }) {
  return (
    <div
      className={`bg-[#191919] content-stretch flex flex-col gap-[32px] items-center py-[71px] w-[1280px] ${className}`}
      data-name="Frame"
      data-node-id={nodeId}
    >
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[24px] items-center leading-[0] not-italic relative shrink-0 text-center w-full">
        <div className="flex flex-col font-['Inter:Bold'] font-bold justify-center min-w-full relative shrink-0 text-[40px] text-white w-[min-content]">
          <p>
            <Txt k="sections.ctaTitle" />
          </p>
        </div>
        <div className="flex flex-col font-['Aileron:Regular'] justify-center relative shrink-0 text-[#e8e8e8] text-[20px] w-[1189px] whitespace-pre-wrap">
          <p className="leading-[1.5]">
            <Txt className="leading-[1.5]" k="sections.ctaText" />
          </p>
        </div>
      </div>
      <div
        className="border border-solid border-white content-stretch flex gap-[4px] items-center justify-center p-[16px] relative rounded-[999px] shrink-0"
        data-name="CTA"
        data-path="/contact"
      >
        <p className="[word-break:break-word] font-['Anuphan:Medium'] font-medium leading-[1.2] relative shrink-0 text-[16px] text-white tracking-[0.64px] uppercase whitespace-nowrap"><Txt k="sections.ctaButton" /></p>
        <div className="relative shrink-0 size-[20px]" data-name="arrow-forward">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={asset("b3d9b.svg")} />
        </div>
      </div>
    </div>
  )
}
