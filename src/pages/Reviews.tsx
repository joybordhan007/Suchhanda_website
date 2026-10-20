import { useEffect, useRef, useState, type ChangeEvent } from "react"
import Footer from "../components/Footer"

const initialReviews = ["/assets/bbc34.png", "/assets/bbc34.png", "/assets/bbc34.png"]

export default function Reviews() {
  const [images, setImages] = useState(initialReviews)
  const objectUrls = useRef<string[]>([])

  const addImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const urls = files.map((file) => URL.createObjectURL(file))
    objectUrls.current.push(...urls)
    setImages((current) => [...current, ...urls])
    event.target.value = ""
  }

  useEffect(() => {
    return () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

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
          <label className="reviews-upload">
            Add review images
            <input
              accept="image/*"
              multiple
              onChange={addImages}
              type="file"
            />
          </label>
        </div>
        <div className="reviews-grid">
          {images.map((src, index) => (
            <figure className="review-image" key={`${src}-${index}`}>
              <img alt={`Client review ${index + 1}`} src={src} />
            </figure>
          ))}
        </div>
      </section>
      <Footer flow />
    </div>
  )
}
