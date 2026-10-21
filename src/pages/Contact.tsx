import { useState, type FormEvent } from "react"
import Footer from "../components/Footer"
import { api, ApiError } from "../content/api"
import { useSiteContent } from "../content/store"
import { newLeadEventId, trackLead } from "../tracking"
import { assetPathPrefix } from "../paths"
const imgTelephone11 = `${assetPathPrefix}/9aeb0.png`
const imgEllipse123 = `${assetPathPrefix}/78707.svg`
const imgEllipse121 = `${assetPathPrefix}/e44b5.svg`
const imgEllipse122 = `${assetPathPrefix}/d441a.svg`
const imgPhoneCall01 = `${assetPathPrefix}/bfbad.svg`
const imgMail01 = `${assetPathPrefix}/805c3.svg`
const imgMarkerPin01 = `${assetPathPrefix}/cb13c.svg`
const imgClock = `${assetPathPrefix}/ce72e.svg`

export default function ContactMe() {
  const { settings } = useSiteContent()
  const [submitStatus, setSubmitStatus] =
    useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorText, setErrorText] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const eventId = newLeadEventId()
    const formData = { ...Object.fromEntries(new FormData(form).entries()), eventId }
    setErrorText("")
    setSubmitStatus("sending")

    try {
      await api("/messages", { method: "POST", body: JSON.stringify(formData) })
      trackLead(eventId)
      form.reset()
      setSubmitStatus("sent")
    } catch (error) {
      console.error("Contact form submission failed:", error)
      // Show what the server said (missing field, too many messages); otherwise a general note.
      setErrorText(error instanceof ApiError && error.status < 500 ? error.message : "")
      setSubmitStatus("error")
    }
  }

  return (
    <div
      className="bg-[#fefefe] relative size-full"
      data-node-id="1:2025"
      data-name="Contact Me"
    >
      <div
        className="absolute h-[585px] left-0 overflow-clip top-0 w-[1920px]"
        data-node-id="1:2026"
        data-name="Hero"
      >
        <div
          className="[word-break:break-word] absolute content-stretch flex flex-col gap-[32px] items-center left-[410px] text-[#191919] top-[208px] w-[1100px]"
          data-node-id="1:2027"
          data-name="Frame"
        >
          <p
            className="font-['Noto_Serif:Bold'] font-bold leading-[0] relative shrink-0 text-[64px] whitespace-nowrap"
            data-node-id="1:2028"
            style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}
          >
            <span className="leading-[1.2]">{`Get `}</span>
            <span className="leading-[1.2] text-[#c7994b]">in Touch</span>
          </p>
          <p
            className="font-['Anuphan:Regular'] font-normal leading-[1.3] min-w-full relative shrink-0 text-[32px] text-center w-[min-content]"
            data-node-id="1:2029"
          >{`Ready to start your growth journey? We'd love to hear from you.`}</p>
        </div>
      </div>
      <Footer top={2432} />
      <div
        className="-translate-x-1/2 absolute content-stretch flex gap-[24px] items-center left-1/2 px-[320px] top-[511px] w-[1920px]"
        data-node-id="1:2112"
        data-name="Frame"
      >
        <div
          className="flex flex-row items-center self-stretch"
          data-node-id="1:2113"
        >
          <div
            className="bg-white content-stretch flex flex-col gap-[120px] h-full items-start overflow-clip px-[24px] py-[32px] relative rounded-[8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] shrink-0 w-[504px]"
            data-name="contact"
          >
            <div
              className="absolute left-[-75px] size-[286px] top-[-54px]"
              data-node-id="1:2114"
            >
              <img
                alt=""
                className="absolute block inset-0 max-w-none size-full"
                src={imgEllipse123}
              />
            </div>
            <div
              className="[word-break:break-word] content-stretch flex flex-col font-['Aileron:SemiBold'] gap-[10px] items-start not-italic relative shrink-0 text-[#191919] w-full"
              data-node-id="1:2115"
              data-name="Frame"
            >
              <p
                className="leading-[1.2] relative shrink-0 text-[32px] whitespace-nowrap"
                data-node-id="1:2116"
              >
                Contact Information
              </p>
              <p
                className="leading-[1.3] min-w-full relative shrink-0 text-[18px] w-[min-content]"
                data-node-id="1:2117"
              >
                Find all the ways to reach us, including email, phone, and our
                office address, so you can get the support and answers you need
                quickly and easily.
              </p>
            </div>
            <div
              className="-translate-x-1/2 absolute h-[281px] left-[calc(50%+0.03px)] top-0 w-[164.054px]"
              data-node-id="1:2118"
              data-name="telephone1 1"
            >
              <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
                <img
                  alt=""
                  className="absolute h-[161.57%] left-[-42.97%] max-w-none top-[-0.01%] w-[195.38%]"
                  src={imgTelephone11}
                />
              </div>
            </div>
            <div
              className="absolute left-[251px] size-[138px] top-[584px]"
              data-node-id="1:2119"
            >
              <img
                alt=""
                className="absolute block inset-0 max-w-none size-full"
                src={imgEllipse121}
              />
            </div>
            <div
              className="absolute left-[295px] size-[269px] top-[608px]"
              data-node-id="1:2120"
            >
              <img
                alt=""
                className="absolute block inset-0 max-w-none size-full"
                src={imgEllipse122}
              />
            </div>
            <div
              className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full"
              data-node-id="1:2121"
              data-name="Frame"
            >
              <div
                className="content-stretch flex gap-[20px] items-start relative shrink-0"
                data-node-id="1:2122"
                data-name="Frame"
              >
                <div
                  className="relative shrink-0 size-[24px]"
                  data-node-id="1:2123"
                  data-name="phone-call-01"
                >
                  <img
                    alt=""
                    className="absolute block inset-0 max-w-none size-full"
                    src={imgPhoneCall01}
                  />
                </div>
                <p
                  className="[word-break:break-word] font-['Aileron:Regular'] leading-[1.5] not-italic relative shrink-0 text-[#191919] text-[18px] whitespace-nowrap"
                  data-node-id="1:2124"
                >
                  {settings.phone}
                </p>
              </div>
              <div
                className="content-stretch flex gap-[20px] items-start relative shrink-0"
                data-node-id="1:2125"
                data-name="Frame"
              >
                <div
                  className="relative shrink-0 size-[24px]"
                  data-node-id="1:2126"
                  data-name="mail-01"
                >
                  <img
                    alt=""
                    className="absolute block inset-0 max-w-none size-full"
                    src={imgMail01}
                  />
                </div>
                <p
                  className="[word-break:break-word] font-['Aileron:Regular'] leading-[1.5] not-italic relative shrink-0 text-[#191919] text-[18px] whitespace-nowrap"
                  data-node-id="1:2127"
                >
                  {settings.email}
                </p>
              </div>
              <div
                className="content-stretch flex gap-[20px] items-start relative shrink-0 w-full"
                data-node-id="1:2128"
                data-name="Frame"
              >
                <div
                  className="relative shrink-0 size-[24px]"
                  data-node-id="1:2129"
                  data-name="marker-pin-01"
                >
                  <img
                    alt=""
                    className="absolute block inset-0 max-w-none size-full"
                    src={imgMarkerPin01}
                  />
                </div>
                <p
                  className="[word-break:break-word] font-['Aileron:Regular'] leading-[1.5] not-italic relative shrink-0 text-[#191919] text-[18px] w-[392px]"
                  data-node-id="1:2130"
                >
                  {settings.address}
                </p>
              </div>
            </div>
          </div>
        </div>
        <form
          className="contact-form bg-white content-stretch flex flex-[1_0_0] flex-col gap-[56px] items-center min-w-px overflow-clip p-[32px] relative rounded-[8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]"
          data-node-id="1:2131"
          data-name="Frame"
          onSubmit={handleSubmit}
        >
          {/* Hidden from people; spam bots fill it in and their message is dropped. */}
          <input
            aria-hidden="true"
            autoComplete="off"
            className="contact-form-trap"
            name="website"
            tabIndex={-1}
          />
          <div
            className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full"
            data-node-id="1:2132"
            data-name="Frame"
          >
            <div
              className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full"
              data-node-id="1:2133"
              data-name="Frame"
            >
              <div
                className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px px-[4px] relative"
                data-node-id="1:2134"
                data-name="Frame"
              >
                <div
                  className="[word-break:break-word] flex flex-col font-['Inter:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[16px] text-center uppercase whitespace-nowrap"
                  data-node-id="1:2135"
                >
                  <p>
                    <span className="leading-[1.1]">{`First Name `}</span>
                    <span className="leading-[1.1] text-[red]">*</span>
                  </p>
                </div>
                <div
                  className="border border-[rgba(25,25,25,0.2)] border-solid content-stretch flex items-center px-[16px] py-[20px] relative rounded-[8px] shrink-0 w-full"
                  data-node-id="1:2136"
                  data-name="Frame"
                >
                  <input
                    aria-label="First name"
                    autoComplete="given-name"
                    className="contact-form-control"
                    name="firstName"
                    placeholder="Jane"
                    required
                  />
                </div>
              </div>
              <div
                className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px px-[4px] relative"
                data-node-id="1:2138"
                data-name="Frame"
              >
                <div
                  className="[word-break:break-word] flex flex-col font-['Inter:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[16px] text-center uppercase whitespace-nowrap"
                  data-node-id="1:2139"
                >
                  <p>
                    <span className="leading-[1.1]">{`Last Name `}</span>
                    <span className="leading-[1.1] text-[red]">*</span>
                  </p>
                </div>
                <div
                  className="border border-[rgba(25,25,25,0.2)] border-solid content-stretch flex items-center px-[16px] py-[20px] relative rounded-[8px] shrink-0 w-full"
                  data-node-id="1:2140"
                  data-name="Frame"
                >
                  <input
                    aria-label="Last name"
                    autoComplete="family-name"
                    className="contact-form-control"
                    name="lastName"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>
            <div
              className="content-stretch flex gap-[48px] items-center relative shrink-0 w-full"
              data-node-id="1:2142"
              data-name="Frame"
            >
              <div
                className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px px-[4px] relative"
                data-node-id="1:2143"
                data-name="Frame"
              >
                <div
                  className="[word-break:break-word] flex flex-col font-['Inter:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[16px] uppercase w-full"
                  data-node-id="1:2144"
                >
                  <p>
                    <span className="leading-[1.1]">{`Email `}</span>
                    <span className="leading-[1.1] text-[red]">*</span>
                  </p>
                </div>
                <div
                  className="border border-[rgba(25,25,25,0.2)] border-solid content-stretch flex items-center px-[16px] py-[20px] relative rounded-[8px] shrink-0 w-full"
                  data-node-id="1:2145"
                  data-name="Frame"
                >
                  <input
                    aria-label="Email"
                    autoComplete="email"
                    className="contact-form-control"
                    name="email"
                    placeholder="jane@example.com"
                    required
                    type="email"
                  />
                </div>
              </div>
              <div
                className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px px-[4px] relative"
                data-node-id="1:2147"
                data-name="Frame"
              >
                <div
                  className="[word-break:break-word] flex flex-col font-['Inter:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[16px] uppercase w-full"
                  data-node-id="1:2148"
                >
                  <p>
                    <span className="leading-[1.1]">{`Phone Number `}</span>
                    <span className="leading-[1.1] text-[red]">*</span>
                  </p>
                </div>
                <div
                  className="border border-[rgba(25,25,25,0.2)] border-solid content-stretch flex items-center px-[16px] py-[20px] relative rounded-[8px] shrink-0 w-full"
                  data-node-id="1:2149"
                  data-name="Frame"
                >
                  <input
                    aria-label="Phone number"
                    autoComplete="tel"
                    className="contact-form-control"
                    name="phone"
                    placeholder="(555) 555-1234"
                    required
                    type="tel"
                  />
                </div>
              </div>
            </div>
            <div
              className="content-stretch flex gap-[48px] items-start relative shrink-0 w-full"
              data-node-id="1:2151"
              data-name="Frame"
            >
              <div
                className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px px-[4px] relative"
                data-node-id="1:2152"
                data-name="Frame"
              >
                <div
                  className="[word-break:break-word] flex flex-col font-['Inter:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[16px] uppercase w-full"
                  data-node-id="1:2153"
                >
                  <p>
                    <span className="leading-[1.1]">{`Company Name `}</span>
                    <span className="leading-[1.1] text-[#e80000]">*</span>
                  </p>
                </div>
                <div
                  className="border border-[rgba(25,25,25,0.2)] border-solid content-stretch flex items-center px-[16px] py-[20px] relative rounded-[8px] shrink-0 w-full"
                  data-node-id="1:2154"
                  data-name="Frame"
                >
                  <input
                    aria-label="Company name"
                    autoComplete="organization"
                    className="contact-form-control"
                    name="company"
                    placeholder="Enter your company name"
                    required
                  />
                </div>
              </div>
              <div
                className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px px-[4px] relative self-stretch"
                data-node-id="1:2156"
                data-name="Frame"
              >
                <div
                  className="[word-break:break-word] flex flex-col font-['Inter:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[16px] uppercase w-full"
                  data-node-id="1:2157"
                >
                  <p>
                    <span className="leading-[1.1]">{` Preferred Contact Time `}</span>
                    <span className="leading-[1.1] text-[red]">*</span>
                  </p>
                </div>
                <div
                  className="border border-[rgba(25,25,25,0.2)] border-solid content-stretch flex flex-[1_0_0] items-center justify-between min-h-px px-[16px] py-[20px] relative rounded-[8px] w-full"
                  data-node-id="1:2158"
                  data-name="Frame"
                >
                  <select
                    aria-label="Preferred contact time"
                    className="contact-form-control"
                    defaultValue=""
                    name="preferredContactTime"
                    required
                  >
                    <option disabled value="">
                      Select preferred time
                    </option>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                  </select>
                  <div
                    className="relative shrink-0 size-[18px]"
                    data-node-id="1:2160"
                    data-name="clock"
                  >
                    <img
                      alt=""
                      className="absolute block inset-0 max-w-none size-full"
                      src={imgClock}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="content-stretch flex flex-col gap-[16px] items-start px-[4px] relative shrink-0 w-full"
              data-node-id="1:2161"
              data-name="Frame"
            >
              <div
                className="[word-break:break-word] flex flex-col font-['Inter:Regular'] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#191919] text-[16px] uppercase w-full"
                data-node-id="1:2162"
              >
                <p className="leading-[1.1]">Message</p>
              </div>
              <div
                className="border border-[rgba(25,25,25,0.2)] border-solid content-stretch flex h-[226px] items-start px-[16px] py-[20px] relative rounded-[8px] shrink-0 w-full"
                data-node-id="1:2163"
                data-name="Frame"
              >
                <textarea
                  aria-label="Message"
                  className="contact-form-control h-full resize-none"
                  name="message"
                  placeholder="Tell us about your project..."
                />
              </div>
            </div>
          </div>
          <button
            className="bg-[#091e39] content-stretch flex items-center justify-center px-[32px] py-[16px] relative rounded-[8px] shrink-0 w-full disabled:cursor-wait disabled:opacity-70"
            data-node-id="1:2165"
            data-name="CTA"
            disabled={submitStatus === "sending"}
            type="submit"
          >
            <span
              className="[word-break:break-word] block font-['Aileron:SemiBold'] leading-[1.2] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap"
              data-node-id="1:2166"
            >
              {submitStatus === "sending" ? "Sending..." : "Send Inquiry"}
            </span>
          </button>
          {submitStatus !== "idle" && submitStatus !== "sending" && (
            <p
              aria-live="polite"
              className={`w-full text-[16px] ${
                submitStatus === "sent" ? "text-green-700" : "text-red-700"
              }`}
            >
              {submitStatus === "sent"
                ? "Your inquiry has been sent. Thank you!"
                : errorText || `We couldn't send your inquiry. Please try again or email us directly at ${settings.email}.`}
            </p>
          )}
        </form>
      </div>
      <div
        className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[56px] items-center justify-center leading-[0] left-1/2 top-[1461px] w-[1280px]"
        data-node-id="1:2167"
        data-name="Frame"
      >
        <p
          className="[word-break:break-word] font-['Noto_Serif:Bold'] font-bold relative shrink-0 text-[#191919] text-[64px] whitespace-nowrap"
          data-node-id="1:2168"
          style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}
        >
          <span className="leading-[1.2]">{`VIEW ON `}</span>
          <span className="leading-[1.2] text-[#c7994b]">GOOGLE MAPS</span>
        </p>
        <iframe
          className="h-[730px] w-[1280px] rounded-[8px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`}
          title={`Map showing ${settings.address}`}
        />
      </div>
    </div>
  )
}
