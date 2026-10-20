import { useSiteContent } from "../content/store"
import { mediaUrl } from "../paths"

export default function TrustedLogos({ className = "" }: { className?: string }) {
  const { clientLogos } = useSiteContent()
  if (clientLogos.length === 0) return null

  return (
    <div className={`trusted-logo-window ${className}`}>
      <div className="trusted-logo-track">
        {[0, 1].map((copy) => (
          <div
            aria-hidden={copy === 1}
            className="trusted-logo-set"
            key={copy}
          >
            {clientLogos.map((logo) => (
              <div className="trusted-logo" key={logo.id}>
                <img alt={copy === 0 ? logo.name : ""} src={mediaUrl(logo.image)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
