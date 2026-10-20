import Footer from "../components/Footer"

export default function Reviews() {
  return (
    <div className="reviews-page" data-name="Reviews">
      <section className="reviews-hero">
        <p className="reviews-eyebrow">Client success stories</p>
        <h1>
          Trusted by Businesses, <span>Proven by Results</span>
        </h1>
        <p className="reviews-intro">
          A closer look at the feedback and results shared by the businesses I
          work with.
        </p>
      </section>
      <section aria-label="Client reviews" className="reviews-gallery">
        <div className="reviews-toolbar">
          <h2>Client Reviews</h2>
        </div>
        <div className="reviews-grid">
          {[1, 2, 3].map((review) => (
            <figure className="review-image" key={review}>
              <img alt={`Client review ${review}`} src="/assets/bbc34.png" />
            </figure>
          ))}
        </div>
      </section>
      <section aria-labelledby="reviews-cta-title" className="reviews-cta">
        <div>
          <h2 id="reviews-cta-title">
            Ready to Elevate <span>Your Brand?</span>
          </h2>
          <p>
            Let&apos;s create something extraordinary together. Schedule a
            consultation to discuss your vision.
          </p>
        </div>
        <a data-path="/contact" href="/contact">
          Let&apos;s work Together <span aria-hidden="true">→</span>
        </a>
      </section>
      <Footer flow />
    </div>
  )
}
