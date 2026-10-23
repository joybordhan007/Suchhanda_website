import { Lines } from "../components/HeroText"
import HighlightText from "../components/HighlightText"
import { fontStyle } from "../content/fonts"
import Footer from "../components/Footer"
import Stats from "../components/Stats"

import { useSiteContent } from "../content/store"
import { assetPathPrefix, mediaUrl, safeHref } from "../paths";
import Txt, { useSiteText } from "../components/Txt"
const imgImage4 = `${assetPathPrefix}/164ce.png`;
const imgImage5 = `${assetPathPrefix}/72b1a.png`;
const imgImage6 = `${assetPathPrefix}/953fa.png`;
const imgArrowForward = `${assetPathPrefix}/b3d9b.svg`;
const imgGroup4 = `${assetPathPrefix}/0f14c.svg`;

export default function AboutMe() {
  const { images, settings, heroes, about } = useSiteContent()
  const hero = heroes.about
  const aboutTextStyle = useSiteText()("about.aboutText").style
  // An empty line in the dashboard text starts a new paragraph.
  const paragraphs = about.text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
  return (
    <div className="bg-[#fefefe] relative size-full" data-node-id="1:1403" data-name="About Me">
      <div className="absolute h-[764px] left-0 overflow-clip top-0 w-[1920px]" data-node-id="1:1404" data-name="Frame">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[64px] items-center justify-center left-1/2 top-[calc(50%+58px)] w-[1140px]" data-node-id="1:1405" data-name="Frame">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[32px] items-center justify-center leading-[0] relative shrink-0 text-[#091e39] text-center w-full" data-node-id="1:1406" data-name="Frame">
            <div className="font-['Noto_Serif:Bold'] font-bold min-w-full relative shrink-0 text-[64px] w-[min-content] whitespace-pre-wrap" data-node-id="1:1407" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100', ...fontStyle(hero.titleFont) }}>
              <p>
                <HighlightText text={hero.title} />
              </p>
            </div>
            <div className="font-['Noto_Sans:Regular'] font-normal relative shrink-0 text-[24px] w-full" data-node-id="1:1408" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100', ...fontStyle(hero.descriptionFont) }}>
              <p className="leading-[1.4]">
                <Lines text={hero.description} />
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="1:1409" data-name="Frame">
            <div className="bg-[#091e39] content-stretch flex items-center justify-center px-[20px] py-[16.5px] relative rounded-[999px] shrink-0 w-[176px]" data-node-id="1:1410" data-name="Frame" data-path="/work">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.2] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="1:1411">
                <Txt k="about.workButton" />
              </p>
            </div>
            <div className="border border-[#091e39] border-solid content-stretch flex items-center justify-center px-[20px] py-[16.5px] relative rounded-[999px] shrink-0 w-[176px]" data-node-id="1:1412" data-name="Frame" data-path="/contact">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.2] not-italic relative shrink-0 text-[#091e39] text-[16px] whitespace-nowrap" data-node-id="1:1413">
                <Txt k="about.contactButton" />
              </p>
            </div>
          </div>
        </div>
      </div>
      <Stats className="-translate-x-1/2 absolute left-1/2 top-[768px]" />
      <div className="-translate-x-1/2 absolute bg-[#191919] content-stretch flex flex-col gap-[32px] items-center left-1/2 py-[71px] top-[2902px] w-[1280px]" data-node-id="1:1427" data-name="Frame">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[24px] items-center leading-[0] not-italic relative shrink-0 text-center w-full" data-node-id="1:1428" data-name="Frame">
          <div className="flex flex-col font-['Inter:Bold'] font-bold justify-center min-w-full relative shrink-0 text-[40px] text-white w-[min-content]" data-node-id="1:1429">
            <p>
              <Txt k="sections.ctaTitle" />
            </p>
          </div>
          <div className="flex flex-col font-['Aileron:Regular'] justify-center relative shrink-0 text-[#e8e8e8] text-[20px] w-[1189px] whitespace-pre-wrap" data-node-id="1:1430">
            <p className="leading-[1.5]">
              <Txt className="leading-[1.5]" k="sections.ctaText" />
            </p>
          </div>
        </div>
        <div className="border border-solid border-white content-stretch flex gap-[4px] items-center justify-center p-[16px] relative rounded-[999px] shrink-0" data-name="CTA" data-path="/contact">
          <p className="[word-break:break-word] font-['Anuphan:Medium'] font-medium leading-[1.2] relative shrink-0 text-[16px] text-white tracking-[0.64px] uppercase whitespace-nowrap" data-node-id="1:1432"><Txt k="sections.ctaButton" /></p>
          <div className="relative shrink-0 size-[20px]" data-node-id="1:1433" data-name="arrow-forward">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowForward} />
          </div>
        </div>
      </div>
      <Footer top={3369} />
      <div className="-translate-x-1/2 absolute content-stretch flex gap-[50px] items-center left-1/2 top-[984px] w-[1280px]" data-node-id="1:1516" data-name="Frame">
        <div className="h-[698px] relative rounded-[16px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] shrink-0 w-[600px]" data-node-id="1:1517">
          <img alt={settings.ownerName} className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={mediaUrl(images.aboutPortrait)} />
        </div>
        <div className="flex flex-row items-center self-stretch" data-node-id="1:1518">
          <div className="bg-white content-stretch drop-shadow-[0px_2px_4px_rgba(0,0,0,0.1)] flex flex-col gap-[24px] h-full items-start justify-center px-[40px] py-[32px] relative rounded-[16px] shrink-0 w-[630px]" data-name="Frame">
            {paragraphs.map((paragraph, index) => (
              <div
                className="[word-break:break-word] flex flex-col font-['Inter:Regular'] font-normal justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#3e3e3e] text-[24px] w-[min-content]"
                data-node-id={index === 0 ? "1:1519" : undefined}
                key={index}
              >
                <p className="leading-[1.4]" style={aboutTextStyle}>
                  <Lines text={paragraph} />
                </p>
              </div>
            ))}
            <div className="absolute inset-[12.75%_24.75%]" data-node-id="1:1522">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup4} />
            </div>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[56px] items-center left-1/2 top-[1802px] w-[1280px]" data-node-id="1:1529" data-name="Frame">
        <div className="[word-break:break-word] flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#191919] text-[32px] whitespace-nowrap" data-node-id="1:1530" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          <p>
            <Txt k="about.featuredHeading" />
          </p>
        </div>
        <div className="featured-row content-stretch flex gap-[24px] items-center justify-center relative shrink-0 w-full" data-node-id="1:1531" data-name="Frame">
          {about.featured.map((item) => {
            const image = <img alt={item.name} className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[2px] size-full" src={mediaUrl(item.image)} />
            const box = "featured-item aspect-[765/677] flex-[1_0_0] max-w-[411px] min-w-px relative rounded-[2px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.1)]"
            return item.url ? (
              <a
                aria-label={`${item.name || "Featured article"} (opens in a new tab)`}
                className={`${box} block transition-shadow hover:shadow-[0px_6px_18px_0px_rgba(0,0,0,0.16)]`}
                href={safeHref(/^([a-z]+:|\/)/i.test(item.url) ? item.url : `https://${item.url}`)}
                key={item.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                {image}
              </a>
            ) : (
              <div className={box} key={item.id}>
                {image}
              </div>
            )
          })}
        </div>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[56px] items-center left-1/2 top-[2375px] w-[1280px]" data-node-id="1:1535" data-name="Frame">
        <div className="[word-break:break-word] flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#191919] text-[32px] whitespace-nowrap" data-node-id="1:1536" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          <p>
            <Txt k="about.certificationsHeading" />
          </p>
        </div>
        <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full" data-node-id="1:1537" data-name="Frame">
          <div className="aspect-[1024/791] flex-[1_0_0] min-w-px relative rounded-[2px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.1)]" data-node-id="1:1538" data-name="image 4">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[2px] size-full" src={imgImage4} />
          </div>
          <div className="aspect-[1600/1236] flex-[1_0_0] min-w-px relative rounded-[2px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.1)]" data-node-id="1:1539" data-name="image 5">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[2px] size-full" src={imgImage5} />
          </div>
          <div className="aspect-[1024/790] flex-[1_0_0] min-w-px relative rounded-[2px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.1)]" data-node-id="1:1540" data-name="image 6">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[2px] size-full" src={imgImage6} />
          </div>
        </div>
      </div>
    </div>
  );
}