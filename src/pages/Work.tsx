import CtaBanner from "../components/CtaBanner"
import Footer from "../components/Footer"
import Reviews from "../components/Reviews"
import Stats from "../components/Stats"
import TrustedLogos from "../components/TrustedLogos"
import { latestWork } from "../content/selectors"
import { useSiteContent } from "../content/store"
import { mediaUrl } from "../paths"

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size))
}

export default function Work() {
  const content = useSiteContent()
  const rows = chunk(latestWork(content.work), 2)

  return (
    <div className="flow-page bg-[#fefefe] relative w-full pb-0" data-node-id="1:1172" data-name="Work">
      <div className="relative h-[764px] overflow-clip w-[1920px]" data-node-id="1:1173" data-name="Frame">
        <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[64px] items-center justify-center left-1/2 top-[255px] w-[1263px]" data-node-id="1:1174" data-name="Frame">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[32px] items-start relative shrink-0 text-[#091e39] text-center w-full" data-node-id="1:1175" data-name="Frame">
            <div className="font-['Noto_Serif:Bold'] font-bold leading-[0] relative shrink-0 text-[64px] w-full whitespace-pre-wrap" data-node-id="1:1176" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
              <p className="mb-0">
                <span className="leading-[1.2]">{`Real Growth `}</span>
                <span className="leading-[1.2] text-[#c7994b]">{`Starts with `}</span>
              </p>
              <p>
                <span className="leading-[1.2] text-[#c7994b]">the Right</span>
                <span className="leading-[1.2]">{` Strategy`}</span>
              </p>
            </div>
            <p className="font-['Noto_Sans:Regular'] font-normal leading-[1.4] relative shrink-0 text-[24px] w-full" data-node-id="1:1177" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{`Below you'll find a selection of campaigns I've managed for clients across different industries. Each case study shows the challenge, strategy, and measurable outcome.`}</p>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="1:1178" data-name="Frame">
            <div className="bg-[#091e39] content-stretch flex items-center justify-center px-[20px] py-[16.5px] relative rounded-[999px] shrink-0 w-[176px]" data-node-id="1:1179" data-name="Frame" data-path="/about">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.2] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap" data-node-id="1:1180">
                About Me
              </p>
            </div>
            <div className="border border-[#091e39] border-solid content-stretch flex items-center justify-center px-[20px] py-[16.5px] relative rounded-[999px] shrink-0 w-[176px]" data-node-id="1:1181" data-name="Frame" data-path="/contact">
              <p className="[word-break:break-word] font-['Inter:Medium'] font-medium leading-[1.2] not-italic relative shrink-0 text-[#091e39] text-[16px] whitespace-nowrap" data-node-id="1:1182">
                Contact Me
              </p>
            </div>
          </div>
        </div>
      </div>
      <Stats className="mx-auto mt-[4px]" />
      <div className="mx-auto mt-[136px] flex flex-col gap-[80px] items-start w-[1280px]" data-node-id="1:1300" data-name="Frame">
        {rows.length === 0 && <p className="w-full text-center text-[18px] text-[#3e3e3e]">Case studies are coming soon.</p>}
        {rows.map((row, index) => (
          <div className="content-stretch flex gap-[24px] items-stretch relative shrink-0 w-full" data-name="Frame" key={index}>
            {row.map((item) => (
              <div
                className="work-case-card bg-[#f5f5f5] content-stretch drop-shadow-[0px_1px_5px_rgba(0,0,0,0.1)] flex flex-col gap-[32px] items-start relative rounded-[24px] shrink-0 w-[768px]"
                data-name="Frame"
                id={`work-${item.id}`}
                key={item.id}
              >
                <div className="h-[450px] relative rounded-[24px] shrink-0 w-full overflow-hidden">
                  {item.image && <img alt={item.title} className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[24px] size-full" src={mediaUrl(item.image)} />}
                </div>
                <div className="content-stretch flex flex-col items-start pb-[32px] px-[32px] relative shrink-0 w-full" data-name="Frame">
                  <div className="[word-break:break-word] content-stretch flex flex-col gap-[24px] items-start leading-[0] relative shrink-0 w-full" data-name="Frame">
                    <div className="flex flex-col font-['Inter:Italic'] font-normal italic justify-center relative shrink-0 text-[#2f2f2f] text-[16px] w-full">
                      <p className="leading-[1.2]">{item.title}</p>
                    </div>
                    {item.description && (
                      <div className="flex flex-col font-['Inter:Regular'] font-normal justify-center not-italic relative shrink-0 text-[#3e3e3e] text-[18px] w-full">
                        <p className="leading-[1.3]">{item.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-[120px] content-stretch flex flex-col gap-[56px] items-start w-[1280px]" data-node-id="1:1196" data-name="Frame">
        <div className="[word-break:break-word] flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#191919] text-[32px] w-[1280px]" data-node-id="1:1197" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          <p>
            <span className="leading-[1.2]">{`Trusted by `}</span>
            <span className="leading-[1.2] text-[#c7994b]">Businesses of all sizes</span>
          </p>
        </div>
        <TrustedLogos className="h-[40px] shrink-0 w-[1280px]" />
      </div>
      <div className="mx-auto mt-[120px] content-stretch flex flex-col gap-[56px] items-start w-[1280px]" data-node-id="1:1199" data-name="Frame">
        <div className="[word-break:break-word] flex flex-col font-['Noto_Serif:SemiBold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#191919] text-[32px] w-[1280px]" data-node-id="1:1201" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          <p>
            <span className="leading-[1.2]">{`Trusted by `}</span>
            <span className="leading-[1.2] text-[#c7994b]">Businesses Proven by Results</span>
          </p>
        </div>
        <Reviews />
      </div>
      <CtaBanner className="mx-auto mt-[120px]" nodeId="1:1211" />
      <div className="mt-[120px]">
        <Footer />
      </div>
    </div>
  )
}
