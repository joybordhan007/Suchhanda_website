import { useEffect, useRef, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { submitReview } from "../content/reviews"
import Txt from "./Txt"

const MAX_PHOTO_BYTES = 10 * 1024 * 1024
const MAX_TEXT = 1000

const inputClass =
  "w-full rounded-[12px] border border-[#d9d9d9] bg-white px-[14px] py-[12px] text-[15px] text-[#191919] outline-none transition focus:border-[#c7994b] focus:ring-4 focus:ring-[#c7994b]/15"

// The "Add review" popup. It is rendered on <body>, outside the scaled design canvas,
// so it keeps its real size on every screen.
export default function ReviewModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [trap, setTrap] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const dialog = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    dialog.current?.querySelector<HTMLElement>("input:not([type=file]):not([tabindex='-1'])")?.focus()
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  useEffect(() => () => URL.revokeObjectURL(preview), [preview])

  const choosePhoto = (file: File | undefined) => {
    setError("")
    if (!file) return
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return setError("Please choose a JPG, PNG, WebP or GIF photo.")
    if (file.size > MAX_PHOTO_BYTES) return setError("The photo must be 10 MB or smaller.")
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return setError("Please enter your name.")
    if (!rating) return setError("Please choose a star rating.")
    if (text.trim().length < 10) return setError("Please write a few words about your experience.")
    setStatus("sending")
    setError("")
    try {
      await submitReview({ name: name.trim(), company: company.trim(), role: role.trim(), rating, text: text.trim(), photo, trap })
      setStatus("sent")
    } catch (submitError) {
      setStatus("idle")
      setError(submitError instanceof Error ? submitError.message : "Your review could not be sent. Please try again.")
    }
  }

  const shown = hover || rating

  return createPortal(
    <div className="review-modal fixed inset-0 z-[2000] flex items-end justify-center bg-[#091e39]/55 p-[12px] backdrop-blur-[2px] sm:items-center sm:p-[24px]" onClick={onClose}>
      <div
        aria-labelledby="review-modal-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-[520px] flex-col overflow-hidden rounded-[20px] bg-white font-['Inter:Regular'] shadow-[0_24px_64px_rgba(9,30,57,0.28)]"
        onClick={(event) => event.stopPropagation()}
        ref={dialog}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-[16px] border-b border-[#f0f0f0] px-[24px] py-[20px]">
          <div>
            <h2 className="font-['Noto_Serif:Bold'] text-[24px] font-bold leading-[1.2] text-[#191919]" id="review-modal-title">
              <Txt k={status === "sent" ? "reviews.thanksTitle" : "reviews.formTitle"} />
            </h2>
            {status !== "sent" && (
              <p className="mt-[6px] text-[14px] text-[#667085]">
                <Txt className="leading-[1.4]" k="reviews.formText" />
              </p>
            )}
          </div>
          <button aria-label="Close" className="flex size-[36px] shrink-0 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#f5f5f5] hover:text-[#191919]" onClick={onClose} type="button">
            <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {status === "sent" ? (
          <div className="flex flex-col items-center gap-[16px] px-[24px] py-[40px] text-center">
            <span className="flex size-[56px] items-center justify-center rounded-full bg-[#ecfdf3] text-[#067647]">
              <svg aria-hidden="true" fill="none" height="28" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="28">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <p className="max-w-[360px] text-[16px] leading-[1.5] text-[#3e3e3e]"><Txt className="leading-[1.5]" k="reviews.thanksText" />
            </p>
            <button className="mt-[8px] rounded-full bg-[#091e39] px-[28px] py-[14px] text-[15px] font-medium text-white transition hover:bg-[#12305a]" onClick={onClose} type="button">
              Done
            </button>
          </div>
        ) : (
          <form className="flex flex-col gap-[20px] overflow-y-auto px-[24px] py-[24px]" noValidate onSubmit={(event) => void submit(event)}>
            <div className="flex items-center gap-[16px]">
              <button
                aria-label={photo ? "Change photo" : "Add a photo"}
                className="relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#d9d9d9] bg-[#fafafa] text-[#98a2b3] transition hover:border-[#c7994b]"
                onClick={() => fileInput.current?.click()}
                type="button"
              >
                {preview ? (
                  <img alt="" className="size-full object-cover" src={preview} />
                ) : (
                  <svg aria-hidden="true" fill="none" height="28" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="28">
                    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                )}
              </button>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[14px] font-semibold text-[#344054]">
                  Your photo <span className="font-normal text-[#98a2b3]">(optional)</span>
                </span>
                <span className="text-[13px] text-[#667085]">JPG, PNG or WebP, up to 10 MB. Without a photo, your initial is shown.</span>
                {photo && (
                  <button
                    className="self-start text-[13px] font-medium text-[#b42318] hover:underline"
                    onClick={() => {
                      setPhoto(null)
                      setPreview("")
                      if (fileInput.current) fileInput.current.value = ""
                    }}
                    type="button"
                  >
                    Remove photo
                  </button>
                )}
              </div>
              <input accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => choosePhoto(event.target.files?.[0])} ref={fileInput} type="file" />
            </div>

            <label className="flex flex-col gap-[6px]">
              <span className="text-[14px] font-semibold text-[#344054]">Name</span>
              <input autoComplete="name" className={inputClass} maxLength={80} onChange={(event) => setName(event.target.value)} placeholder="Your name" value={name} />
            </label>

            <div className="grid gap-[16px] sm:grid-cols-2">
              <label className="flex flex-col gap-[6px]">
                <span className="text-[14px] font-semibold text-[#344054]">
                  Company <span className="font-normal text-[#98a2b3]">(optional)</span>
                </span>
                <input autoComplete="organization" className={inputClass} maxLength={80} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" value={company} />
              </label>
              <label className="flex flex-col gap-[6px]">
                <span className="text-[14px] font-semibold text-[#344054]">
                  Your role <span className="font-normal text-[#98a2b3]">(optional)</span>
                </span>
                <input autoComplete="organization-title" className={inputClass} maxLength={80} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Founder, CTO" value={role} />
              </label>
            </div>

            <fieldset className="flex flex-col gap-[6px]">
              <legend className="mb-[6px] text-[14px] font-semibold text-[#344054]">Rating</legend>
              <div className="flex items-center gap-[4px]" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    aria-pressed={rating === star}
                    className="rounded-[6px] p-[2px] transition hover:scale-110"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    type="button"
                  >
                    <svg aria-hidden="true" fill={star <= shown ? "#facc15" : "#e5e7eb"} height="32" viewBox="0 0 20 20" width="32">
                      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
                    </svg>
                  </button>
                ))}
                {shown > 0 && <span className="ml-[8px] text-[14px] text-[#667085]">{["Poor", "Fair", "Good", "Very good", "Excellent"][shown - 1]}</span>}
              </div>
            </fieldset>

            <label className="flex flex-col gap-[6px]">
              <span className="flex items-baseline justify-between text-[14px] font-semibold text-[#344054]">
                Review
                <span className="text-[12px] font-normal text-[#98a2b3]">
                  {text.length}/{MAX_TEXT}
                </span>
              </span>
              <textarea
                className={`${inputClass} min-h-[132px] resize-y`}
                maxLength={MAX_TEXT}
                onChange={(event) => setText(event.target.value)}
                placeholder="What was it like working together? What results did you get?"
                value={text}
              />
            </label>

            {/* Hidden checkbox that people never see; bots tick every box. */}
            <input aria-hidden="true" checked={trap} className="hidden" name="confirm_robot" onChange={(event) => setTrap(event.target.checked)} tabIndex={-1} type="checkbox" />

            {error && (
              <p className="rounded-[12px] bg-[#fef3f2] px-[14px] py-[10px] text-[14px] text-[#b42318]" role="alert">
                {error}
              </p>
            )}

            <button
              className="rounded-full bg-[#091e39] px-[24px] py-[15px] text-[16px] font-medium text-white transition hover:bg-[#12305a] disabled:opacity-60"
              disabled={status === "sending"}
              type="submit"
            >
              {status === "sending" ? "Sending…" : <Txt k="reviews.formButton" />}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}
