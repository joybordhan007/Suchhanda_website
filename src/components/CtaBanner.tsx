import { asset } from "../paths"

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
            <span className="leading-[1.2]">{`Ready to Elevate `}</span>
            <span className="leading-[1.2] text-[#c7994b]">Your Brand?</span>
          </p>
        </div>
        <div className="flex flex-col font-['Aileron:Regular'] justify-center relative shrink-0 text-[#e8e8e8] text-[20px] w-[1189px] whitespace-pre-wrap">
          <p className="leading-[1.5] mb-0">{`Let's create something extraordinary together. Schedule a consultation `}</p>
          <p className="leading-[1.5]">to discuss your vision.</p>
        </div>
      </div>
      <div
        className="border border-solid border-white content-stretch flex gap-[4px] items-center justify-center p-[16px] relative rounded-[999px] shrink-0"
        data-name="CTA"
        data-path="/contact"
      >
        <p className="[word-break:break-word] font-['Anuphan:Medium'] font-medium leading-[1.2] relative shrink-0 text-[16px] text-white tracking-[0.64px] uppercase whitespace-nowrap">{`Let's work Together`}</p>
        <div className="relative shrink-0 size-[20px]" data-name="arrow-forward">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={asset("b3d9b.svg")} />
        </div>
      </div>
    </div>
  )
}
