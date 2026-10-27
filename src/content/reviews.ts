import { useEffect, useSyncExternalStore } from "react"
import { api } from "./api"
import { shrinkImage } from "./shrinkImage"
import type { Review } from "./types"

// Approved reviews from the server, loaded once and shared by every page that shows them.
type State = { reviews: Review[]; loaded: boolean }

// Approved reviews the server put into the page (server/app.ts, pageWithContent).
const embedded = (window as { __SITE_REVIEWS__?: Review[] }).__SITE_REVIEWS__

let state: State = Array.isArray(embedded) ? { reviews: embedded, loaded: true } : { reviews: [], loaded: false }
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

function setState(next: State) {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function loadReviews() {
  loading ??= api<{ reviews: Review[] }>("/reviews")
    .then(({ reviews }) => setState({ reviews, loaded: true }))
    .catch(() => setState({ reviews: [], loaded: true }))
    .finally(() => {
      loading = null
    })
  return loading
}

export function useApprovedReviews() {
  const current = useSyncExternalStore(subscribe, () => state)
  useEffect(() => {
    if (!state.loaded) void loadReviews()
  }, [])
  return current
}

export type NewReview = { name: string; company: string; role: string; rating: number; text: string; photo: File | null; trap: boolean }

// Sends a visitor's review; it shows on the website once approved in the dashboard.
export async function submitReview(review: NewReview) {
  const body = new FormData()
  body.append("name", review.name)
  body.append("company", review.company)
  body.append("role", review.role)
  body.append("rating", String(review.rating))
  body.append("text", review.text)
  if (review.trap) body.append("confirm_robot", "1")
  // Shown at most 50px wide, so a small copy is plenty.
  if (review.photo) body.append("photo", await shrinkImage(review.photo, 400))
  await api("/reviews", { method: "POST", body })
}
