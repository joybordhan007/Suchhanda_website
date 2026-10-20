import Footer from "../components/Footer"

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <header className="legal-hero">
        <p>Terms of Service</p>
        <span>Terms for accessing and using this portfolio website.</span>
      </header>
      <main className="legal-content">
        <p className="legal-updated">Last updated: October 20, 2026</p>
        <h1>Using this website</h1>
        <p>
          This website provides general information about digital marketing
          services, work examples, and ways to get in touch. By using it, you
          agree to use the site lawfully and not interfere with its operation.
        </p>
        <h2>Information and services</h2>
        <p>
          Website content is provided for general information. A service
          relationship, scope, fees, timelines, and deliverables are confirmed
          separately in writing. Results shown in portfolio examples are
          specific to those projects and do not guarantee similar results.
        </p>
        <h2>Content and external links</h2>
        <p>
          Unless otherwise stated, the website design and original written
          content belong to their respective owners. Third-party names,
          materials, or links remain the property and responsibility of their
          owners. External sites are provided for convenience and are not
          controlled by this website.
        </p>
        <h2>Availability and changes</h2>
        <p>
          The website is provided on an “as available” basis. Content and these
          terms may be updated from time to time. Questions about these terms
          can be sent to{" "}
          <a href="mailto:adritamondol065@gmail.com">
            adritamondol065@gmail.com
          </a>
          .
        </p>
      </main>
      <Footer top={1905} />
    </div>
  )
}
