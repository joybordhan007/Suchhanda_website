import { useSiteContent } from "../content/store"
import { asset, mediaUrl, safeHref, withBase } from "../paths"

type FooterProps = {
  top?: number
}

const quickLinks = [
  ["Home", "/"],
  ["Service", "/service"],
  ["Work", "/work"],
  ["About Me", "/about"],
  ["Blog", "/blog"],
  ["Reviews", "/reviews"],
] as const

const supportLinks = [
  ["Contact Us", "/contact"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms of Service", "/terms-of-service"],
] as const

function FooterLinks({
  title,
  links,
}: {
  title: string
  links: readonly (readonly [string, string])[]
}) {
  return (
    <section className="flex flex-col items-start gap-[24px]">
      <h2 className="font-['Inter:Semi_Bold'] text-[20px] font-semibold leading-[1.2] text-[#191919]">
        {title}
      </h2>
      <ul className="flex flex-col items-start gap-[16px]">
        {links.map(([label, href]) => (
          <li key={href}>
            <a className="footer-link" data-path={href} href={withBase(href)}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Footer({ top }: FooterProps) {
  const { settings } = useSiteContent()
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
            I’m {settings.ownerName} — helping brands scale faster with
            high-converting ads, precise tracking, and performance-driven
            strategy that delivers real, lasting results.
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
          <FooterLinks links={quickLinks} title="Quick Links" />
          <FooterLinks links={supportLinks} title="Support" />
          <section className="site-footer-contact flex flex-col items-start gap-[24px]">
            <h2 className="font-['Inter:Semi_Bold'] text-[20px] font-semibold leading-[1.2] text-[#191919]">
              Contact Info
            </h2>
            <ul className="flex flex-col items-start gap-[16px]">
              <li>
                <a className="footer-link" href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>
                  {settings.phone}
                </a>
              </li>
              <li>
                <a
                  className="footer-link"
                  href={`mailto:${settings.email}`}
                >
                  {settings.email}
                </a>
              </li>
              <li>
                <a
                  className="footer-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {settings.address}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
      <div className="site-footer-bottom">
        <p>Copyright © {new Date().getFullYear()} SUCHHANDA MONDOL</p>
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
