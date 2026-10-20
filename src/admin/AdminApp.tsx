import { useCallback, useEffect, useState, type ComponentType } from "react"
import { api, ApiError } from "../content/api"
import { loadContent, resetContent, saveContent, useContentReady, useSiteContent } from "../content/store"
import type { ContactMessage, SiteContent } from "../content/types"
import { asset, stripBase, withBase } from "../paths"
import LoginPage, { type AdminUser } from "./LoginPage"
import AccountSection from "./sections/AccountSection"
import BlogSection from "./sections/BlogSection"
import DashboardSection from "./sections/DashboardSection"
import ImagesSection from "./sections/ImagesSection"
import LogosSection from "./sections/LogosSection"
import MessagesSection from "./sections/MessagesSection"
import ReviewsSection from "./sections/ReviewsSection"
import ServicesSection from "./sections/ServicesSection"
import SettingsSection from "./sections/SettingsSection"
import StatsSection from "./sections/StatsSection"
import WorkSection from "./sections/WorkSection"
import type { SectionProps } from "./types"

const sections = [
  { id: "", label: "Dashboard", icon: "◧" },
  { id: "services", label: "Services", icon: "◆" },
  { id: "work", label: "Work", icon: "▣" },
  { id: "blog", label: "Blog", icon: "✎" },
  { id: "messages", label: "Messages", icon: "✉" },
  { id: "stats", label: "Achievements", icon: "▲" },
  { id: "logos", label: "Client Logos", icon: "◎" },
  { id: "reviews", label: "Reviews", icon: "★" },
  { id: "images", label: "Page Images", icon: "▧" },
  { id: "settings", label: "Site Settings", icon: "⚙" },
  { id: "account", label: "Account", icon: "◉" },
] as const

type SectionId = (typeof sections)[number]["id"]

// Sections that edit the website content (and share the Save bar).
const contentSections: Partial<Record<SectionId, ComponentType<SectionProps>>> = {
  services: ServicesSection,
  work: WorkSection,
  blog: BlogSection,
  stats: StatsSection,
  logos: LogosSection,
  reviews: ReviewsSection,
  images: ImagesSection,
  settings: SettingsSection,
}

function getSection(): SectionId {
  const id = (stripBase(window.location.pathname) ?? "").replace(/^\/admin\/?/, "")
  return sections.some((section) => section.id === id) ? (id as SectionId) : ""
}

export default function AdminApp() {
  // undefined while checking the session, null when signed out.
  const [admin, setAdmin] = useState<AdminUser | null | undefined>(undefined)

  useEffect(() => {
    document.title = "Admin · Suchhanda Mondol"
    api<{ admin: AdminUser }>("/auth/me")
      .then(({ admin: current }) => setAdmin(current))
      .catch(() => setAdmin(null))
  }, [])

  if (admin === undefined) {
    return <div className="flex min-h-dvh items-center justify-center bg-[#091e39] text-white/70">Loading…</div>
  }
  if (admin === null) return <LoginPage onSignedIn={setAdmin} />
  return <Dashboard admin={admin} onSignedOut={() => setAdmin(null)} />
}

function Dashboard({ admin, onSignedOut }: { admin: AdminUser; onSignedOut: () => void }) {
  const ready = useContentReady()
  const saved = useSiteContent()
  const [draft, setDraft] = useState<SiteContent | null>(null)
  // Bumped when the draft is replaced, so editors drop any local typing state.
  const [revision, setRevision] = useState(0)
  const [section, setSection] = useState<SectionId>(getSection)
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; text?: string }>({ kind: "idle" })
  const [unread, setUnread] = useState<number | null>(null)
  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved)

  useEffect(() => {
    void loadContent()
    api<{ messages: ContactMessage[] }>("/messages")
      .then(({ messages }) => setUnread(messages.filter((message) => !message.isRead).length))
      .catch(() => setUnread(null))
    const popstate = () => setSection(getSection())
    window.addEventListener("popstate", popstate)
    return () => window.removeEventListener("popstate", popstate)
  }, [])

  useEffect(() => {
    if (ready && draft === null) setDraft(saved)
  }, [ready, draft, saved])

  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [isDirty])

  const handleUnread = useCallback((count: number) => setUnread(count), [])

  const open = (next: string) => {
    const id = sections.some((item) => item.id === next) ? (next as SectionId) : ""
    window.history.pushState({}, "", withBase(id ? `/admin/${id}` : "/admin"))
    setSection(id)
    window.scrollTo(0, 0)
  }

  const replaceDraft = (next: SiteContent) => {
    setDraft(next)
    setRevision((value) => value + 1)
  }

  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      onSignedOut()
      return
    }
    setStatus({ kind: "error", text: error instanceof Error ? error.message : "Could not save." })
  }

  const save = async () => {
    if (!draft) return
    setStatus({ kind: "saving" })
    try {
      setDraft(await saveContent(draft))
      setStatus({ kind: "saved" })
    } catch (error) {
      handleError(error)
    }
  }

  const reset = async () => {
    if (!window.confirm("Replace ALL website content with the original content? Your saved changes will be lost.")) return
    setStatus({ kind: "saving" })
    try {
      replaceDraft(await resetContent())
      setStatus({ kind: "saved" })
    } catch (error) {
      handleError(error)
    }
  }

  const signOut = async () => {
    if (isDirty && !window.confirm("You have unsaved changes. Sign out anyway?")) return
    await api("/auth/logout", { method: "POST" }).catch(() => undefined)
    onSignedOut()
  }

  const ContentSection = contentSections[section]
  const showSaveBar = Boolean(ContentSection)
  const navButton = (active: boolean) =>
    `flex shrink-0 items-center gap-[10px] rounded-[8px] px-[14px] py-[10px] text-left text-[15px] transition ${
      active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white"
    }`

  return (
    <div className="min-h-dvh bg-[#f4f5f7] font-['Inter:Regular'] text-[#191919] lg:flex">
      <aside className="bg-[#091e39] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[260px] lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-[12px] px-[20px] py-[18px] lg:block">
          <img alt="Suchhanda" className="h-[32px] brightness-0 invert" src={asset("4a673.svg")} />
          <p className="mt-[6px] hidden text-[12px] uppercase tracking-[0.2em] text-[#c7994b] lg:block">Admin</p>
        </div>
        <nav aria-label="Admin sections" className="flex gap-[4px] overflow-x-auto px-[12px] pb-[12px] lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {sections.map((item) => (
            <button
              aria-current={section === item.id ? "page" : undefined}
              className={navButton(section === item.id)}
              key={item.id || "dashboard"}
              onClick={() => open(item.id)}
              type="button"
            >
              <span aria-hidden="true" className="w-[18px] text-center text-[#c7994b]">
                {item.icon}
              </span>
              {item.label}
              {item.id === "messages" && (unread ?? 0) > 0 && (
                <span className="ml-auto rounded-full bg-[#c7994b] px-[7px] text-[12px] font-semibold text-[#091e39]">{unread}</span>
              )}
            </button>
          ))}
        </nav>
        <a className="hidden px-[26px] py-[18px] text-[14px] text-white/60 hover:text-white lg:block" href={withBase("/")} rel="noreferrer" target="_blank">
          View website ↗
        </a>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {showSaveBar && (
          <div className="sticky top-0 z-10 flex flex-wrap items-center justify-end gap-[10px] border-b border-[rgba(0,0,0,0.08)] bg-white/90 px-[16px] py-[12px] backdrop-blur sm:px-[32px]">
            <span aria-live="polite" className="mr-auto text-[14px] text-[#777]">
              {status.kind === "saving" && "Saving…"}
              {status.kind === "saved" && !isDirty && "All changes saved and live on the website."}
              {status.kind === "error" && <span className="text-red-700">{status.text}</span>}
              {(status.kind === "idle" || (status.kind === "saved" && isDirty)) &&
                (isDirty ? "You have unsaved changes." : "No changes.")}
            </span>
            <button className="rounded-[8px] px-[14px] py-[9px] text-[14px] text-[#555] hover:text-red-700" onClick={reset} type="button">
              Reset to original
            </button>
            <button
              className="rounded-[8px] border border-[rgba(25,25,25,0.2)] bg-white px-[16px] py-[9px] text-[14px] disabled:opacity-40"
              disabled={!isDirty}
              onClick={() => {
                replaceDraft(saved)
                setStatus({ kind: "idle" })
              }}
              type="button"
            >
              Discard
            </button>
            <button
              className="rounded-[8px] bg-[#091e39] px-[20px] py-[9px] text-[14px] font-medium text-white disabled:opacity-40"
              disabled={!isDirty || status.kind === "saving"}
              onClick={save}
              type="button"
            >
              Save changes
            </button>
          </div>
        )}
        <main className="mx-auto w-full max-w-[1100px] px-[16px] py-[32px] sm:px-[32px]">
          {!draft ? (
            <p className="text-[15px] text-[#777]">Loading content…</p>
          ) : ContentSection ? (
            <ContentSection
              content={draft}
              key={`${section}-${revision}`}
              onChange={(patch) => {
                setDraft((current) => (current ? { ...current, ...patch } : current))
                setStatus({ kind: "idle" })
              }}
            />
          ) : section === "messages" ? (
            <MessagesSection onUnreadCount={handleUnread} />
          ) : section === "account" ? (
            <AccountSection email={admin.email} onSignOut={signOut} />
          ) : (
            <DashboardSection content={draft} onOpen={open} unreadMessages={unread} />
          )}
        </main>
      </div>
    </div>
  )
}
