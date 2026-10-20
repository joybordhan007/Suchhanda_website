type FooterProps = {
  top?: number
}

export const BUSINESS_ADDRESS = "Mirpur 2, Dhaka, Bangladesh"

const quickLinks = [
  ["Home", "/"],
  ["Service", "/service"],
  ["Work", "/work"],
  ["About Me", "/about"],
  ["Blog", "/blog"],
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
            <a className="footer-link" data-path={href} href={href}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Footer({ top = 0 }: FooterProps) {
  return (
    <footer
      className="site-footer site-footer-absolute"
      style={{ top }}
    >
      <div className="site-footer-content">
        <div className="site-footer-brand">
          <div className="h-[70px] w-[280px]">
            <img alt="Suchhanda Mondol" className="h-full w-full object-contain object-left" src="/assets/5d363.svg" />
          </div>
          <p>
            I’m Suchhanda Mondol — helping brands scale faster with
            high-converting ads, precise tracking, and performance-driven
            strategy that delivers real, lasting results.
          </p>
          <div aria-label="Social media" className="flex items-center gap-[16px]">
            <a aria-label="Facebook" href="https://www.facebook.com/" rel="noreferrer" target="_blank">
              <img alt="" src="/assets/4aa89.svg" />
            </a>
            <a aria-label="LinkedIn" href="https://www.linkedin.com/" rel="noreferrer" target="_blank">
              <img alt="" src="/assets/0684a.svg" />
            </a>
            <a aria-label="WhatsApp" href="https://wa.me/8801947760296" rel="noreferrer" target="_blank">
              <img alt="" src="/assets/a4902.svg" />
            </a>
          </div>
        </div>
        <div className="site-footer-navigation">
          <FooterLinks links={quickLinks} title="Quick Links" />
          <FooterLinks links={supportLinks} title="Support" />
          <section className="flex w-[363px] flex-col items-start gap-[24px]">
            <h2 className="font-['Inter:Semi_Bold'] text-[20px] font-semibold leading-[1.2] text-[#191919]">
              Contact Info
            </h2>
            <ul className="flex flex-col items-start gap-[16px]">
              <li>
                <a className="footer-link" href="tel:+8801947760296">
                  +8801947760296
                </a>
              </li>
              <li>
                <a className="footer-link" href="mailto:adritamondol065@gmail.com">
                  adritamondol065@gmail.com
                </a>
              </li>
              <li>
                <a
                  className="footer-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_ADDRESS)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {BUSINESS_ADDRESS}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </footer>
  )
}
