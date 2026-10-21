// Google Tag Manager and Meta (Facebook) Pixel, loaded on the public site only when
// their IDs are set in the dashboard (Site Settings → Tracking), plus the site's own
// visit counter behind the dashboard charts.
import type { TrackingSettings } from "./content/types"
import { withBase } from "./paths"

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: Fbq }

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    fbq?: Fbq
    _fbq?: Fbq
  }
}

export const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,12}$/
export const META_PIXEL_ID_PATTERN = /^\d{10,20}$/

let gtmLoaded = ""
let pixelLoaded = ""

function addScript(src: string) {
  const script = document.createElement("script")
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

function loadGtm(id: string) {
  if (gtmLoaded || !GTM_ID_PATTERN.test(id)) return
  gtmLoaded = id
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" })
  addScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`)
}

// Meta's standard loader: queues calls until fbevents.js arrives.
function loadPixel(id: string) {
  if (pixelLoaded || !META_PIXEL_ID_PATTERN.test(id)) return
  pixelLoaded = id
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue.push(args)
    } as Fbq
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = "2.0"
    fbq.queue = []
    window.fbq = fbq
    window._fbq = fbq
    addScript("https://connect.facebook.net/en_US/fbevents.js")
  }
  window.fbq("init", id)
}

export function setupTracking(settings: TrackingSettings) {
  if (settings.gtmEnabled) loadGtm(settings.gtmId.trim())
  if (settings.metaPixelEnabled) loadPixel(settings.metaPixelId.trim())
}

let landed = false

// Counts the visit for the dashboard's own statistics (no cookies, no third party).
function recordVisit(path: string) {
  const landing = !landed
  landed = true
  void fetch(withBase("/api/track"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, landing, referrer: landing ? document.referrer : "" }),
    keepalive: true,
  }).catch(() => undefined)
}

// Call on every page change (the site never reloads between pages).
export function trackPageView(path: string) {
  recordVisit(path)
  if (gtmLoaded) {
    window.dataLayer?.push({ event: "page_view", page_path: path, page_title: document.title, page_location: window.location.href })
  }
  if (pixelLoaded) window.fbq?.("track", "PageView")
}

// ID shared by the browser Pixel "Lead" and the server's Conversions API copy, so Meta
// counts the lead once.
export function newLeadEventId() {
  return `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// A contact form was sent.
export function trackLead(eventId: string) {
  if (gtmLoaded) window.dataLayer?.push({ event: "generate_lead", form: "contact", event_id: eventId })
  if (pixelLoaded) window.fbq?.("track", "Lead", {}, { eventID: eventId })
}
