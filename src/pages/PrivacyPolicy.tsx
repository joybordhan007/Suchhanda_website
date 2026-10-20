import Footer from "../components/Footer"
import { useSiteContent } from "../content/store"

export default function PrivacyPolicy() {
  const { settings } = useSiteContent()
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <p>Privacy Policy</p>
        <span>How personal information is handled when you use this website.</span>
      </header>
      <main className="legal-content">
        <p className="legal-updated">Last updated: October 20, 2026</p>
        <h1>Information and privacy</h1>
        <p>
          This website is a portfolio and contact point for {settings.ownerName}.
          Information you choose to send through the contact form or by email
          is used to respond to your inquiry and discuss requested services.
        </p>
        <h2>Information collected</h2>
        <p>
          Messages may include your name, email address, phone number, company
          details, and any project information you provide. The website may
          also receive standard technical information from your browser or
          hosting provider, such as device and request data.
        </p>
        <h2>Use and sharing</h2>
        <p>
          Personal information is not sold. It may be handled by service
          providers needed to host the site or deliver communications, or
          disclosed when required by law. Information is kept only as long as
          reasonably needed to respond and maintain business records.
        </p>
        <h2>Your choices and contact</h2>
        <p>
          You may request access to, correction of, or deletion of information
          you have provided, subject to applicable requirements. Contact{" "}
          <a href={`mailto:${settings.email}`}>
            {settings.email}
          </a>{" "}
          with privacy questions. This policy may be updated as the website or
          applicable requirements change.
        </p>
      </main>
      <Footer top={1905} />
    </div>
  )
}
