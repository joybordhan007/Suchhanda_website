const logos = [
  { src: "/assets/5c6b9.svg", name: "Nagad" },
  { src: "/assets/e6b17.svg", name: "BRAC" },
  { src: "/assets/a7d41.svg", name: "Google" },
  { src: "/assets/54b41.svg", name: "bKash" },
  { src: "/assets/3aaae.svg", name: "Facebook" },
  { src: "/assets/e9a13.svg", name: "WhatsApp" },
  { src: "/assets/24766.svg", name: "YouTube" },
  { src: "/assets/e19b7.svg", name: "TikTok" },
  { src: "/assets/3efa1.svg", name: "Microsoft Teams" },
  { src: "/assets/975d6.svg", name: "Twitter" },
]

export default function TrustedLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`trusted-logo-window ${className}`}>
      <div className="trusted-logo-track">
        {[0, 1].map((copy) => (
          <div
            aria-hidden={copy === 1}
            className="trusted-logo-set"
            key={copy}
          >
            {logos.map((logo) => (
              <div className="trusted-logo" key={logo.name}>
                <img alt={copy === 0 ? logo.name : ""} src={logo.src} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
