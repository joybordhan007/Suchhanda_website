import type { CSSProperties } from "react"
import type { TextKey } from "../content/siteText"
import { useSiteContent } from "../content/store"
import { asset, mediaUrl, safeHref, withBase } from "../paths"
import Txt, { useSiteText } from "./Txt"

type FooterProps = {
  top?: number
}

// Labels come from Site Text; the quick links share the menu's labels.
const quickLinks = [
  ["nav.home", "/"],
  ["nav.service", "/service"],
  ["nav.work", "/work"],
  ["nav.about", "/about"],
  ["nav.blog", "/blog"],
  ["nav.reviews", "/reviews"],
] as const satisfies readonly (readonly [TextKey, string])[]

const supportLinks = [
  ["footer.contactUs", "/contact"],
  ["footer.privacy", "/privacy-policy"],
  ["footer.terms", "/terms-of-service"],
] as const satisfies readonly (readonly [TextKey, string])[]

function FooterLinks({
  title,
  links,
  linkStyle,
}: {
  title: TextKey
  links: readonly (readonly [TextKey, string])[]
  linkStyle: CSSProperties
}) {
  return (
    <section className="flex flex-col items-start gap-[24px]">
      <h2 className="font-['Inter:Semi_Bold'] text-[20px] font-semibold leading-[1.2] text-[#191919]">
        <Txt k={title} />
      </h2>
      <ul className="flex flex-col items-start gap-[16px]">
        {links.map(([label, href]) => (
          <li key={href}>
            <a className="footer-link" data-path={href} href={withBase(href)}>
              <span style={linkStyle}>
                <Txt k={label} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Footer({ top }: FooterProps) {
  const { settings } = useSiteContent()
  const linkStyle = useSiteText()("footer.links").style
  // Pages laid out in normal flow omit `top`; the design-canvas pages position it absolutely.
  const isAbsolute = top !== undefined
  return (
    <footer
      className={`site-footer${isAbsolute ? " site-footer-absolute" : " site-footer-flow"}`}
      style={isAbsolute ? { top } : undefined}
    >
      <div className="site-footer-content">
        <div className="site-footer-brand">
          <div className="site-footer-logo">
            <img
              alt="Suchhanda Mondol"
              className="h-full w-full object-contain object-left"
              src={asset("5d363.svg")}
            />
          </div>
          <p>
            <Txt className="" k="footer.about" />
          </p>
          <div
            aria-label="Social media"
            className="flex items-center gap-[16px]"
          >
            {settings.socials.map((social) => (
              <a
                aria-label={social.label}
                href={safeHref(social.url)}
                key={social.id}
                rel="noreferrer"
                target="_blank"
                title={social.label}
              >
                {social.icon ? (
                  <img alt="" src={mediaUrl(social.icon)} />
                ) : (
                  <span aria-hidden="true" className="social-fallback-icon">
                    {social.label.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
        <div className="site-footer-navigation">
          <FooterLinks linkStyle={linkStyle} links={quickLinks} title="footer.quickLinks" />
          <FooterLinks linkStyle={linkStyle} links={supportLinks} title="footer.support" />
          <section className="site-footer-contact flex flex-col items-start gap-[24px]">
            <h2 className="font-['Inter:Semi_Bold'] text-[20px] font-semibold leading-[1.2] text-[#191919]">
              <Txt k="footer.contactInfo" />
            </h2>
            <ul className="flex flex-col items-start gap-[16px]">
              <li>
                <a className="footer-link" href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>
                  <span style={linkStyle}>{settings.phone}</span>
                </a>
              </li>
              <li>
                <a
                  className="footer-link"
                  href={`mailto:${settings.email}`}
                >
                  <span style={linkStyle}>{settings.email}</span>
                </a>
              </li>
              <li>
                <a
                  className="footer-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span style={linkStyle}>{settings.address}</span>
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
      <div className="site-footer-bottom">
        <p>
          <Txt className="" k="footer.copyright" />
        </p>
        <p>
          Website Designed and Developed by{" "}
          <a href="https://designops.agency" rel="noopener" target="_blank">
            DesignOps
          </a>
        </p>
      </div>
    </footer>
  )
}
