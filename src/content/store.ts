import { useSyncExternalStore } from "react"
import { api } from "./api"
import { defaultContent } from "./defaults"
import type { SiteContent, TrackingSettings } from "./types"

// Gives entries saved before IDs, dates and on/off status existed a number, a date
// and the "active" state, keeping their order.
function withEntryFields<T extends { serial?: number; createdAt?: string }>(items: T[], fallbackDate: string) {
  let next = Math.max(0, ...items.map((item) => item.serial ?? 0))
  return items.map((item) => ({
    ...item,
    serial: item.serial ?? ++next,
    createdAt: item.createdAt ?? fallbackDate,
  }))
}

// Saves from before the on/off switches existed: a filled-in ID meant "on".
function withTrackingDefaults(saved: Partial<TrackingSettings> | undefined): TrackingSettings {
  const gtmId = saved?.gtmId ?? ""
  const metaPixelId = saved?.metaPixelId ?? ""
  return {
    gtmId,
    metaPixelId,
    gtmEnabled: saved?.gtmEnabled ?? gtmId !== "",
    metaPixelEnabled: saved?.metaPixelEnabled ?? metaPixelId !== "",
  }
}

// Fill in anything missing from saved data, so adding new fields never breaks old saves.
function withDefaults(saved: Partial<SiteContent> | null): SiteContent {
  if (!saved) return defaultContent
  const pick = <K extends keyof SiteContent>(key: K) =>
    (Array.isArray(defaultContent[key]) ? Array.isArray(saved[key]) : saved[key] != null)
      ? (saved[key] as SiteContent[K])
      : defaultContent[key]
  const fallbackDate = saved.updatedAt ?? new Date(0).toISOString()
  return {
    settings: {
      ...defaultContent.settings,
      ...saved.settings,
      tracking: withTrackingDefaults(saved.settings?.tracking),
    },
    images: { ...defaultContent.images, ...saved.images },
    stats: pick("stats"),
    services: withEntryFields(pick("services"), fallbackDate).map((service) => ({
      ...service,
      active: service.active ?? true,
    })),
    consultation: { ...defaultContent.consultation, ...saved.consultation },
    clientLogos: pick("clientLogos"),
    reviews: pick("reviews"),
    work: withEntryFields(pick("work"), fallbackDate).map((item) => ({ ...item, active: item.active ?? true })),
    blog: withEntryFields(pick("blog"), fallbackDate),
    updatedAt: saved.updatedAt ?? null,
  }
}

type State = { content: SiteContent; ready: boolean }

let state: State = { content: defaultContent, ready: false }
const listeners = new Set<() => void>()

function setState(next: State) {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

let loading: Promise<void> | null = null

// Loads the saved content once. If the API is unreachable the site keeps its built-in content.
export function loadContent() {
  loading ??= api<{ content: Partial<SiteContent> | null }>("/content")
    .then(({ content }) => setState({ content: withDefaults(content), ready: true }))
    .catch((error) => {
      console.warn("Using built-in content; the content API is unavailable.", error)
      setState({ content: defaultContent, ready: true })
    })
  return loading
}

export async function saveContent(next: SiteContent) {
  const { content } = await api<{ content: SiteContent }>("/content", {
    method: "PUT",
    body: JSON.stringify(next),
  })
  const saved = withDefaults(content)
  setState({ content: saved, ready: true })
  return saved
}

export function resetContent() {
  return saveContent(defaultContent)
}

// Latest saved content, outside React (for saving changes on top of it).
export function getContent() {
  return state.content
}

export function useSiteContent() {
  return useSyncExternalStore(subscribe, () => state).content
}

export function useContentReady() {
  return useSyncExternalStore(subscribe, () => state).ready
}
