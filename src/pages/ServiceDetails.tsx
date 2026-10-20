import { Fragment } from "react"
import Footer from "../components/Footer"
import HighlightText from "../components/HighlightText"
import { useSiteContent } from "../content/store"
import type { TitledItem } from "../content/types"
import { asset, mediaUrl, withBase } from "../paths"

const number = (index: number) => String(index + 1).padStart(2, "0")

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size))
}

function Eyebrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <div className="content-stretch flex gap-[19px] items-center relative shrink-0">
      <div className="bg-[#c7994b] h-px relative shrink-0 w-[30px]" />
      <div
        className={`[word-break:break-word] flex flex-col font-['Noto_Serif:Medium'] font-medium justify-center leading-[0] relative shrink-0 text-[18px] tracking-[1.08px] uppercase whitespace-nowrap ${light ? "text-white" : "text-[#091e39]"}`}
        style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}
      >
        <p className="leading-[1.2]">{children}</p>
      </div>
    </div>
  )
}

function SectionIntro({ eyebrow, heading, description, light = false }: { eyebrow: string; heading: string; description: string; light?: boolean }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <div className={`[word-break:break-word] content-stretch flex flex-col gap-[16px] items-start leading-[0] relative shrink-0 w-full ${light ? "text-white" : "text-[#091e39]"}`}>
        <div className="flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center relative shrink-0 text-[32px] w-full" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          <p>
            <HighlightText text={heading} />
          </p>
        </div>
        {description && (
          <div className="flex flex-col font-['Inter:Regular'] font-normal justify-center not-italic relative shrink-0 text-[16px] w-full">
            <p className="leading-[1.4]">{description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function NumberedCard({ item, index, dark = false }: { item: TitledItem; index: number; dark?: boolean }) {
  return (
    <div
      className={`border border-solid content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-w-px p-[16px] relative rounded-[4px] ${
        dark ? "border-[rgba(0,0,0,0.1)] min-h-[143px]" : "bg-[#f8f8f8] border-[rgba(0,0,0,0.1)] self-stretch"
      }`}
    >
      <div className="service-badge bg-[#191919] content-stretch flex items-center px-[9px] py-[8.5px] relative rounded-[999px] shrink-0">
        <div className="[word-break:break-word] flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center leading-[0] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          <p className="leading-[1.2]">{number(index)}</p>
        </div>
      </div>
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start justify-center leading-[0] not-italic relative shrink-0 w-full">
        <div className={`flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center relative shrink-0 text-[16px] w-full ${dark ? "text-white" : "text-[#191919]"}`}>
          <p className="leading-[1.2]">{item.title}</p>
        </div>
        <div className={`flex flex-col font-['Inter:Regular'] font-normal justify-center relative shrink-0 text-[12px] w-full ${dark ? "text-[#f0f0f0]" : "text-[#1f1f1f]"}`}>
          <p className="leading-[1.2]">{item.description}</p>
        </div>
      </div>
    </div>
  )
}

export default function ServiceDetails({ slug }: { slug?: string }) {
  const { services } = useSiteContent()
  const service = slug ? services.find((item) => item.slug === slug) : services[0]

  if (!service) {
    return (
      <div className="flow-page bg-[#fefefe] relative w-full" data-name="Service Details">
        <div className="mx-auto flex w-[1280px] flex-col items-center gap-[24px] pt-[260px] pb-[200px] text-center text-[#091e39]">
          <p className="font-['Inter:Bold'] text-[48px] font-bold">Service not found</p>
          <p className="text-[18px]">This service may have been renamed or removed.</p>
          <a className="rounded-[999px] bg-[#091e39] px-[24px] py-[14px] text-[16px] text-white" data-path="/" href={withBase("/")}>
            Back to Home
          </a>
        </div>
        <Footer />
      </div>
    )
  }

  const { detail } = service

  return (
    <div className="flow-page bg-[#fefefe] relative w-full" data-node-id="1:877" data-name="Service Details">
      <div className="relative h-[585px] overflow-clip w-[1920px]" data-node-id="1:878" data-name="Hero">
        <div className="-translate-x-1/2 [word-break:break-word] absolute content-stretch flex flex-col gap-[32px] items-center left-1/2 text-[#091e39] text-center top-[208px] w-[1132px]" data-node-id="1:879" data-name="Frame">
          <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0" data-name="Frame">
            {detail.tagline && (
              <p className="font-['Anuphan:Regular'] font-normal leading-[1.3] relative shrink-0 text-[16px] uppercase">{detail.tagline}</p>
            )}
            <h1 className="font-['Noto_Serif:Bold'] font-bold leading-[0] relative shrink-0 text-[64px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
              <HighlightText className="leading-[1.1]" text={detail.heroTitle || service.title} />
            </h1>
          </div>
          {detail.heroDescription && (
            <p className="font-['Anuphan:Regular'] font-normal leading-[1.3] relative shrink-0 text-[20px] w-full">{detail.heroDescription}</p>
          )}
        </div>
      </div>

      {detail.offerings.length > 0 && (
        <div className="mx-auto mt-[150px] content-stretch flex gap-[24px] items-center relative w-[1280px]" data-node-id="1:1008" data-name="Frame">
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[504px]">
            <SectionIntro description={detail.offeringsDescription} eyebrow="Our Services" heading={detail.offeringsHeading || `What's included in *${service.title}*`} />
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-w-px relative">
            {chunk(detail.offerings, 3).map((row, rowIndex) => (
              <div className="content-stretch flex gap-[24px] items-stretch relative shrink-0 w-full" key={rowIndex}>
                {row.map((item) => (
                  <div className="bg-white content-stretch drop-shadow-[0px_2px_2px_rgba(0,0,0,0.1)] flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px pb-[32px] pt-[24px] px-[24px] relative rounded-[8px]" key={item.id}>
                    <div className="service-badge bg-[#282828] content-stretch flex items-center p-[20px] relative rounded-[999px] shrink-0">
                      <div className="relative shrink-0 size-[32px]">
                        {item.icon && <img alt="" className="absolute block inset-0 max-w-none size-full object-contain" src={mediaUrl(item.icon)} />}
                      </div>
                    </div>
                    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start justify-center leading-[0] not-italic relative shrink-0 w-full">
                      <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center relative shrink-0 text-[#191919] text-[20px] w-full">
                        <p className="leading-[1.2]">{item.title}</p>
                      </div>
                      <div className="flex flex-col font-['Inter:Regular'] font-normal justify-center relative shrink-0 text-[#1f1f1f] text-[14px] w-full">
                        <p className="leading-[1.2]">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto mt-[150px] content-stretch flex gap-[24px] items-center relative w-[1280px]" data-node-id="1:1093" data-name="Frame">
        {detail.processImage && (
          <div className="h-[380px] relative shrink-0 w-[502px] overflow-hidden">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={mediaUrl(detail.processImage)} />
          </div>
        )}
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px relative">
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[504px]">
            <SectionIntro description={detail.processDescription} eyebrow="How It Works" heading={detail.processHeading || "My Simple *4-Step Process*"} />
          </div>
          {detail.steps.length > 0 && (
            <div className="content-stretch flex gap-[16px] items-stretch relative shrink-0 w-full">
              {detail.steps.map((step, index) => (
                <NumberedCard index={index} item={step} key={step.id} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-[150px] bg-[#191919] content-stretch flex gap-[24px] items-center p-[40px] rounded-[2px] relative w-[1280px]" data-node-id="1:1128" data-name="Frame">
        <div className="content-stretch flex flex-col gap-[57px] items-start relative shrink-0 w-[745px]">
          <SectionIntro description={detail.whyDescription} eyebrow="Why Choose Me" heading={detail.whyHeading || `Results-Driven *${service.title}*`} light />
          <div className="border border-solid border-white content-stretch flex gap-[4px] items-center justify-center p-[16px] relative rounded-[999px] shrink-0" data-name="CTA" data-path="/contact">
            <p className="[word-break:break-word] font-['Anuphan:Medium'] font-medium leading-[1.2] relative shrink-0 text-[16px] text-white tracking-[0.64px] uppercase whitespace-nowrap">{`Let's work Together`}</p>
            <div className="relative shrink-0 size-[20px]" data-name="arrow-forward">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={asset("b3d9b.svg")} />
            </div>
          </div>
        </div>
        {detail.features.length > 0 && (
          <div className="service-features content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-w-px relative">
            {chunk(detail.features, 2).map((pair, rowIndex) => (
              <Fragment key={rowIndex}>
                {rowIndex > 0 && (
                  <div className="service-features-divider content-stretch flex gap-[42px] items-start relative shrink-0 w-full">
                    <div className="bg-[#d9d9d9] flex-[1_0_0] h-px min-w-px relative" />
                    <div className="bg-[#d9d9d9] flex-[1_0_0] h-px min-w-px relative" />
                  </div>
                )}
                <div className="content-stretch flex items-center relative shrink-0 w-full">
                  {pair.map((feature, index) => (
                    <Fragment key={feature.id}>
                      {index > 0 && <div className="service-features-divider bg-[#d9d9d9] h-[110px] relative shrink-0 w-px" />}
                      <NumberedCard dark index={rowIndex * 2 + index} item={feature} />
                    </Fragment>
                  ))}
                </div>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="mt-[126px]">
        <Footer />
      </div>
    </div>
  )
}
