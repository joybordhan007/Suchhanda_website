import Footer from "../components/Footer"
import { Lines } from "../components/HeroText"
import HighlightText from "../components/HighlightText"
import { fontStyle } from "../content/fonts"
import Reviews from "../components/Reviews"
import ServiceCard from "../components/ServiceCard"
import Stats from "../components/Stats"
import TrustedLogos from "../components/TrustedLogos"
import { homeServices, homeWork } from "../content/selectors"
import { useSiteContent } from "../content/store"
import { assetPathPrefix, mediaUrl, withBase } from "../paths"
import Txt from "../components/Txt"

const imgHrManagementFlatIllustration1 = `${assetPathPrefix}/48813.png`
const imgArrowForward1 = `${assetPathPrefix}/b3d9b.svg`

export default function Home() {
  const content = useSiteContent()
  const hero = content.heroes.home
  const cards = [
    ...homeServices(content.services).map((service) => (
      <ServiceCard
        description={service.summary}
        fonts={service.fonts}
        icon={service.icon}
        key={service.id}
        path={`/service/${service.slug}`}
        title={service.title}
      />
    )),
    <ServiceCard
      actionLabel={<Txt k="home.consultationButton" />}
      description={content.consultation.description}
      fonts={content.consultation.fonts}
      icon={imgHrManagementFlatIllustration1}
      key="consultation"
      path="/contact"
      title={content.consultation.title}
    />,
  ]
  const rows = [cards.slice(0, 3), cards.slice(3, 6)].filter((row) => row.length > 0)
  const recentWork = homeWork(content.work)

  return (
    <div className="bg-[#fefefe] relative size-full" data-node-id="1:347" data-name="Home">
      <div className="absolute h-[860px] left-0 overflow-clip top-0 w-[1920px]" data-node-id="1:348" data-name="Frame">
        <div className="absolute content-stretch flex flex-col gap-[64px] items-start left-[320px] top-[268px] w-[700px]" data-node-id="1:349" data-name="Frame">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[24px] items-start leading-[0] relative shrink-0 w-full" data-node-id="1:350" data-name="Frame">
            <ul className="block font-['Inter:Regular'] font-normal not-italic relative shrink-0 text-[18px] text-black uppercase w-full" data-node-id="1:351">
              <li className="list-disc ms-[27px]">
                <Txt k="home.tagline" />
              </li>
            </ul>
            <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 text-[#191919] w-full whitespace-pre-wrap" data-node-id="1:352" data-name="Frame">
              <div className="font-['Noto_Sans:Bold'] font-bold relative shrink-0 text-[0px] w-[700px]" data-node-id="1:353" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                <p className="font-['Noto_Serif:Bold'] text-[64px]" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100', ...fontStyle(hero.titleFont) }}>
                  <HighlightText text={hero.title} />
                </p>
              </div>
              <div className="font-['Noto_Sans:Regular'] font-normal relative shrink-0 text-[20px] w-full" data-node-id="1:354" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                <p className="leading-[1.4]" style={fontStyle(hero.descriptionFont)}>
                  <Lines text={hero.description} />
                </p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="1:355" data-name="Frame">
            <div className="bg-[#091e39] content-stretch flex items-center justify-center px-[20px] py-[16.5px] relative rounded-[999px] shrink-0 w-[176px]" data-name="CTA" data-path="/work">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.2] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="1:357">
                <Txt k="home.exploreButton" />
              </p>
            </div>
            <div className="border border-[#091e39] border-solid content-stretch flex items-center justify-center px-[20px] py-[16.5px] relative rounded-[999px] shrink-0 w-[176px]" data-name="CTA" data-path="/contact">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.2] not-italic relative shrink-0 text-[#091e39] text-[16px] whitespace-nowrap" data-node-id="1:359">
                <Txt k="home.contactButton" />
              </p>
            </div>
          </div>
        </div>
        <div className="absolute contents left-[1160px] top-[190px]" data-node-id="1:360" data-name="Group">
          <div className="absolute border-20 border-[#c7994b] border-solid h-[500px] left-[1200px] top-[230px] w-[400px]" data-node-id="1:361" />
          <div className="absolute h-[500px] left-[1160px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] top-[190px] w-[400px]" data-node-id="1:362">
            <img alt={content.settings.ownerName} fetchPriority="high" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={mediaUrl(content.images.homeHero)} />
          </div>
        </div>
      </div>
      <Stats className="absolute left-[320px] top-[860px]" />
      <div className="absolute content-stretch flex flex-col gap-[56px] items-start left-[320px] top-[1076px] w-[1280px]" data-node-id="1:376" data-name="Frame">
        <div className="[word-break:break-word] flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#191919] text-[32px] w-full" data-node-id="1:377" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          <p>
            <Txt k="home.servicesHeading" />
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-[56px] items-start relative shrink-0 w-full" data-node-id="1:378" data-name="Frame">
          {rows.map((row, index) => (
            <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full" data-name="Frame" key={index}>
              {row}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[56px] items-center left-[320px] top-[1926px] w-[1280px]" data-node-id="1:447" data-name="Frame">
        <div className="content-stretch flex flex-col gap-[56px] items-start relative shrink-0 w-full" data-node-id="1:448" data-name="Frame">
          <div className="[word-break:break-word] flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#191919] text-[32px] w-full" data-node-id="1:449" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            <p>
              <Txt k="home.workHeading" />
            </p>
          </div>
          <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full" data-node-id="1:450" data-name="Frame">
            {recentWork.map((item) => (
              <a
                aria-label={`View ${item.title}`}
                className="home-work-card"
                data-path={`/work#work-${item.id}`}
                href={withBase(`/work#work-${item.id}`)}
                key={item.id}
              >
                <img decoding="async" loading="lazy" alt="" src={mediaUrl(item.image)} />
              </a>
            ))}
          </div>
        </div>
        <div className="bg-[#091e39] content-stretch flex items-center justify-center px-[20px] py-[16.5px] relative rounded-[999px] shrink-0 w-[176px]" data-name="CTA" data-path="/work">
          <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.2] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="1:457">
            <Txt k="home.workButton" />
          </p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[56px] items-start left-1/2 top-[2543px] w-[1280px]" data-node-id="1:458" data-name="Frame">
        <div className="[word-break:break-word] flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#191919] text-[32px] w-[1280px]" data-node-id="1:459" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          <p>
            <Txt k="sections.logosHeading" />
          </p>
        </div>
        <TrustedLogos className="h-[40px] shrink-0 w-[1280px]" />
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[40px] items-center justify-center left-1/2 top-[2793px] w-[1280px]" data-node-id="1:461" data-name="Frame">
        <div className="content-stretch flex flex-col gap-[56px] items-start relative shrink-0 w-full" data-node-id="1:462" data-name="Frame">
          <div className="[word-break:break-word] flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#191919] text-[32px] w-[1280px]" data-node-id="1:463" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            <p>
              <Txt k="sections.reviewsHeading" />
            </p>
          </div>
          <Reviews />
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bg-[#191919] content-stretch flex flex-col gap-[32px] items-center left-1/2 py-[71px] top-[3446px] w-[1280px]" data-node-id="1:473" data-name="Frame">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[24px] items-center leading-[0] not-italic relative shrink-0 text-center w-full" data-node-id="1:474" data-name="Frame">
          <div className="flex flex-col font-['Inter:Bold'] font-bold justify-center min-w-full relative shrink-0 text-[40px] text-white w-[min-content]" data-node-id="1:475">
            <p>
              <Txt k="sections.ctaTitle" />
            </p>
          </div>
          <div className="flex flex-col font-['Aileron:Regular'] justify-center relative shrink-0 text-[#e8e8e8] text-[20px] w-[1189px] whitespace-pre-wrap" data-node-id="1:476">
            <p className="leading-[1.5]">
              <Txt className="leading-[1.5]" k="sections.ctaText" />
            </p>
          </div>
        </div>
        <div className="border border-solid border-white content-stretch flex gap-[4px] items-center justify-center p-[16px] relative rounded-[999px] shrink-0" data-name="CTA" data-path="/contact">
          <p className="[word-break:break-word] font-['Anuphan:Medium'] font-medium leading-[1.2] relative shrink-0 text-[16px] text-white tracking-[0.64px] uppercase whitespace-nowrap" data-node-id="1:478"><Txt k="sections.ctaButton" /></p>
          <div className="relative shrink-0 size-[20px]" data-node-id="1:479" data-name="arrow-forward">
            <img decoding="async" loading="lazy" alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowForward1} />
          </div>
        </div>
      </div>
      <Footer top={3913} />
    </div>
  )
}
