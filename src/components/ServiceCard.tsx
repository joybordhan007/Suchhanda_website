import type { ReactNode } from "react"
import { fontStyle } from "../content/fonts"
import type { ItemFonts } from "../content/types"
import { asset, mediaUrl } from "../paths"
import Txt from "./Txt"

type ServiceCardProps = {
  title: string
  description: string
  icon: string
  path: string
  actionLabel?: ReactNode
  fonts?: ItemFonts
}

export default function ServiceCard({ title, description, icon, path, actionLabel = <Txt k="home.serviceExplore" />, fonts }: ServiceCardProps) {
  return (
    <div
      className="service-card bg-white border border-[rgba(0,0,0,0.1)] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start justify-center min-w-px p-[24px] relative rounded-[16px]"
      data-name="CTA"
      data-path={path}
    >
      <div className="service-card-icon relative shrink-0 h-[80px]">
        {icon && <img decoding="async" loading="lazy" alt="" className="block h-full w-auto max-w-[160px] object-contain" src={mediaUrl(icon)} />}
      </div>
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
          <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center relative shrink-0 text-[#191919] text-[24px] w-full">
            <p className="leading-[1.2]" style={fontStyle(fonts?.heading)}>
              {title}
            </p>
          </div>
          <div className="flex flex-col font-['Inter:Regular'] font-normal justify-center relative shrink-0 text-[16px] text-black w-full">
            <p className="service-card-summary leading-[1.2]" style={fontStyle(fonts?.text)}>
              {description}
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
          <div className="[word-break:break-word] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#c7994b] text-[18px] whitespace-nowrap">
            <p className="leading-[1.2]">{actionLabel}</p>
          </div>
          <div className="relative shrink-0 size-[24px]" data-name="arrow-forward">
            <img decoding="async" loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={asset("16a89.svg")} />
          </div>
        </div>
      </div>
    </div>
  )
}
