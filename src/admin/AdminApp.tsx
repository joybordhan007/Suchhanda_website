import { useCallback, useEffect, useRef, useState, type ComponentType } from "react"
import { api, ApiError } from "../content/api"
import { getContent, loadContent, saveContent, useContentReady, useSiteContent } from "../content/store"
import type { SiteContent } from "../content/types"
import { asset, mediaUrl, siteHref, stripBase, withBase } from "../paths"
import Icon, { type IconName } from "./components/Icon"
import LoginPage, { type AdminUser } from "./LoginPage"
import AboutSection from "./sections/AboutSection"
import BlogSection from "./sections/BlogSection"
import DashboardSection from "./sections/DashboardSection"
import HeroesSection from "./sections/HeroesSection"
import ImagesSection from "./sections/ImagesSection"
import LogosSection from "./sections/LogosSection"
import MessagesSection from "./sections/MessagesSection"
import ProfileSection from "./sections/ProfileSection"
import ReviewsSection from "./sections/ReviewsSection"
import ServicesSection from "./sections/ServicesSection"
import SettingsSection from "./sections/SettingsSection"
import SiteTextSection from "./sections/SiteTextSection"
import StatsSection from "./sections/StatsSection"
import WorkSection from "./sections/WorkSection"
import type { ManagedSectionProps, SectionProps } from "./types"

const navGroups = [
  { label: "Overview", items: [{ id: "", label: "Dashboard", icon: "dashboard" }] },
  {
    label: "Content",
    items: [
      { id: "services", label: "Services", icon: "services" },
      { id: "work", label: "Work", icon: "work" },
      { id: "blog", label: "Blog", icon: "blog" },
    ],
  },
  {
    label: "Inbox",
    items: [
      { id: "messages", label: "Messages", icon: "messages" },
      { id: "reviews", label: "Reviews", icon: "star" },
    ],
  },
  {
    label: "Website",
    items: [
      { id: "texts", label: "Site Text", icon: "type" },
      { id: "heroes", label: "Page Heroes", icon: "edit" },
      { id: "about", label: "About Page", icon: "user" },
      { id: "stats", label: "Achievements", icon: "award" },
      { id: "logos", label: "Client Logos", icon: "logos" },
      { id: "images", label: "Page Images", icon: "image" },
      { id: "settings", label: "Site Settings", icon: "settings" },
    ],
  },
] as const satisfies { label: string; items: { id: string; label: string; icon: IconName }[] }[]

type SectionId = (typeof navGroups)[number]["items"][number]["id"] | "profile"
type Route = { section: SectionId; itemId?: string }

const sectionLabels: Record<string, string> = {
  ...Object.fromEntries(navGroups.flatMap((group) => group.items.map((item) => [item.id, item.label]))),
  profile: "Profile",
}

// Edited as a whole and saved with the Save button next to the section title.
const draftSections: Partial<Record<SectionId, ComponentType<SectionProps>>> = {
  texts: SiteTextSection,
  heroes: HeroesSection,
  about: AboutSection,
  stats: StatsSection,
  logos: LogosSection,
  images: ImagesSection,
  settings: SettingsSection,
}

// Lists whose changes are saved one item at a time.
const managedSections: Partial<Record<SectionId, ComponentType<ManagedSectionProps>>> = {
  services: ServicesSection,
  work: WorkSection,
  blog: BlogSection,
}

const sectionIds = new Set<string>(Object.keys(sectionLabels))

function getRoute(): Route {
  const [section = "", itemId] = (stripBase(window.location.pathname) ?? "").replace(/^\/admin\/?/, "").split("/")
  return sectionIds.has(section) ? { section: section as SectionId, itemId: itemId || undefined } : { section: "" }
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
    return <div className="admin-ui flex min-h-dvh items-center justify-center text-[var(--admin-muted)]">Loading…</div>
  }
  if (admin === null) return <LoginPage onSignedIn={setAdmin} />
  return <Dashboard admin={admin} onAdminChange={setAdmin} onSignedOut={() => setAdmin(null)} />
}

function Avatar({ admin, size = 36 }: { admin: AdminUser; size?: number }) {
  const initial = (admin.name || admin.email).trim().charAt(0).toUpperCase()
  return admin.avatar ? (
    <img alt="" className="shrink-0 rounded-full object-cover ring-2 ring-white/15" src={mediaUrl(admin.avatar)} style={{ width: size, height: size }} />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d9b46e] to-[#b8873a] font-semibold text-[#091e39]"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  )
}

function Dashboard({
  admin,
  onAdminChange,
  onSignedOut,
}: {
  admin: AdminUser
  onAdminChange: (admin: AdminUser) => void
  onSignedOut: () => void
}) {
  const ready = useContentReady()
  const saved = useSiteContent()
  const [draft, setDraft] = useState<SiteContent | null>(null)
  // Bumped when the draft is replaced, so editors drop any local typing state.
  const [revision, setRevision] = useState(0)
  const [route, setRoute] = useState<Route>(getRoute)
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; text?: string }>({ kind: "idle" })
  const [toast, setToast] = useState<{ kind: "saved" | "error"; text: string } | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const [unread, setUnread] = useState<number | null>(null)
  const [pendingReviews, setPendingReviews] = useState<number | null>(null)
  // The save time is not an edit, so it is left out of the comparison.
  const isDirty = draft !== null && JSON.stringify({ ...draft, updatedAt: null }) !== JSON.stringify({ ...saved, updatedAt: null })

  useEffect(() => {
    void loadContent()
    // Only the unread count is needed here.
    api<{ unread: number }>("/messages?limit=0")
      .then(({ unread: count }) => setUnread(count))
      .catch(() => setUnread(null))
    api<{ counts: { pending: number } }>("/admin/reviews")
      .then(({ counts }) => setPendingReviews(counts.pending))
      .catch(() => setPendingReviews(null))
    const popstate = () => setRoute(getRoute())
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

  const showToast = (next: { kind: "saved" | "error"; text: string }) => {
    window.clearTimeout(toastTimer.current)
    setToast(next)
    toastTimer.current = window.setTimeout(() => setToast(null), 3000)
  }

  const handleUnread = useCallback((count: number) => setUnread(count), [])
  const handlePendingReviews = useCallback((count: number) => setPendingReviews(count), [])

  const open = useCallback((section: string, itemId?: string) => {
    const id = sectionIds.has(section) ? (section as SectionId) : ""
    const path = id ? `/admin/${id}${itemId ? `/${itemId}` : ""}` : "/admin"
    window.history.pushState({}, "", withBase(path))
    setRoute({ section: id, itemId })
    window.scrollTo(0, 0)
  }, [])

  const replaceDraft = (next: SiteContent) => {
    setDraft(next)
    setRevision((value) => value + 1)
  }

  const isSignedOutError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      onSignedOut()
      return true
    }
    return false
  }

  // Saves one change straight away: applied to the saved content (so other unsaved
  // edits are not published with it) and to the draft.
  const commit = async (apply: (content: SiteContent) => SiteContent) => {
    try {
      const result = await saveContent(apply(getContent()))
      setDraft((current) => (current ? { ...apply(current), updatedAt: result.updatedAt } : current))
      showToast({ kind: "saved", text: "Saved — live on the website." })
    } catch (error) {
      if (!isSignedOutError(error)) showToast({ kind: "error", text: error instanceof Error ? error.message : "Could not save." })
      throw error
    }
  }

  const save = async () => {
    if (!draft) return
    setStatus({ kind: "saving" })
    try {
      setDraft(await saveContent(draft))
      setStatus({ kind: "saved" })
    } catch (error) {
      if (!isSignedOutError(error)) setStatus({ kind: "error", text: error instanceof Error ? error.message : "Could not save." })
    }
  }

  const signOut = async () => {
    if (isDirty && !window.confirm("You have unsaved changes. Log out anyway?")) return
    await api("/auth/logout", { method: "POST" }).catch(() => undefined)
    onSignedOut()
  }

  const DraftSection = draftSections[route.section]
  const ManagedSection = managedSections[route.section]
  const sectionLabel = sectionLabels[route.section] ?? "Dashboard"

  const draftActions = (
    <>
      <span aria-live="polite" className="text-[13px] font-medium text-[var(--admin-muted)]">
        {status.kind === "saving" && "Saving…"}
        {status.kind === "saved" && !isDirty && <span className="text-[#067647]">Saved and live</span>}
        {status.kind === "error" && <span className="text-[#b42318]">{status.text}</span>}
        {(status.kind === "idle" || (status.kind === "saved" && isDirty)) && isDirty && (
          <span className="admin-badge bg-[#fdf6e9] text-[var(--admin-gold-ink)]">Unsaved changes</span>
        )}
      </span>
      <button
        className="admin-btn admin-btn-secondary h-[36px]"
        disabled={!isDirty}
        onClick={() => {
          replaceDraft(saved)
          setStatus({ kind: "idle" })
        }}
        type="button"
      >
        Discard
      </button>
      <button className="admin-btn admin-btn-primary h-[36px]" disabled={!isDirty || status.kind === "saving"} onClick={save} type="button">
        Save changes
      </button>
    </>
  )

  return (
    <div className="admin-ui min-h-dvh lg:flex">
      <aside className="relative z-20 bg-[#091e39] text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[264px] lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-[12px] px-[20px] pt-[18px] pb-[10px] lg:block lg:px-[22px] lg:pt-[24px] lg:pb-[18px]">
          <div className="flex items-center gap-[10px]">
            <img alt="Suchhanda" className="h-[30px] brightness-0 invert" src={asset("4a673.svg")} />
          </div>
          <span className="mt-[10px] hidden w-fit rounded-[4px] bg-white/8 px-[10px] py-[3px] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d9b46e] lg:inline-block">
            Admin panel
          </span>
        </div>

        <nav aria-label="Admin sections" className="flex gap-[4px] overflow-x-auto px-[12px] pb-[12px] lg:flex-1 lg:flex-col lg:gap-[18px] lg:overflow-y-auto lg:px-[14px]">
          {navGroups.map((group) => (
            <div className="flex shrink-0 gap-[4px] lg:flex-col lg:gap-[2px]" key={group.label}>
              <p className="hidden px-[12px] pb-[6px] text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38 lg:block">{group.label}</p>
              {group.items.map((item) => {
                const active = route.section === item.id
                return (
                  <button
                    aria-current={active ? "page" : undefined}
                    className={`relative flex shrink-0 items-center gap-[12px] rounded-[4px] px-[12px] py-[9px] text-left text-[14px] font-medium transition ${
                      active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                    key={item.id || "dashboard"}
                    onClick={() => open(item.id)}
                    type="button"
                  >
                    {active && <span aria-hidden="true" className="absolute top-[8px] bottom-[8px] left-0 hidden w-[3px] rounded-full bg-[#d9b46e] lg:block" />}
                    <Icon className={active ? "text-[#d9b46e]" : "text-white/55"} name={item.icon} />
                    {item.label}
                    {item.id === "messages" && (unread ?? 0) > 0 && (
                      <span className="ml-auto rounded-full bg-[#d9b46e] px-[7px] py-[1px] text-[11px] font-bold text-[#091e39]">{unread}</span>
                    )}
                    {item.id === "reviews" && (pendingReviews ?? 0) > 0 && (
                      <span className="ml-auto rounded-full bg-[#d9b46e] px-[7px] py-[1px] text-[11px] font-bold text-[#091e39]" title="Waiting for approval">
                        {pendingReviews}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 p-[14px] lg:block">
          <button
            aria-current={route.section === "profile" ? "page" : undefined}
            className={`flex w-full min-w-0 items-center gap-[10px] rounded-[4px] p-[8px] text-left transition ${
              route.section === "profile" ? "bg-white/10" : "hover:bg-white/5"
            }`}
            onClick={() => open("profile")}
            type="button"
          >
            <Avatar admin={admin} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-white">{admin.name || "Your profile"}</span>
              <span className="block truncate text-[12px] text-white/50">{admin.email}</span>
            </span>
            <Icon className="text-white/40" name="user" size={16} />
          </button>
          <button
            className="mt-[6px] flex w-full items-center gap-[12px] rounded-[4px] px-[12px] py-[9px] text-[14px] font-medium text-white/65 transition hover:bg-white/5 hover:text-[#fda29b]"
            onClick={() => void signOut()}
            type="button"
          >
            <Icon name="logout" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between gap-[12px] border-b border-[var(--admin-border)] bg-white/85 px-[16px] backdrop-blur-md sm:px-[32px]">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-[8px] text-[14px]">
            <button className="text-[var(--admin-muted)] hover:text-[var(--admin-text)]" onClick={() => open("")} type="button">
              Admin
            </button>
            <span aria-hidden="true" className="text-[#d0d5dd]">
              /
            </span>
            <span className={`truncate font-semibold ${route.itemId ? "text-[var(--admin-muted)]" : "text-[var(--admin-text)]"}`}>{sectionLabel}</span>
            {route.itemId && (
              <>
                <span aria-hidden="true" className="text-[#d0d5dd]">
                  /
                </span>
                <span className="truncate font-semibold text-[var(--admin-text)]">Details</span>
              </>
            )}
          </nav>
          <div className="flex items-center gap-[8px]">
            <a className="admin-btn admin-btn-secondary h-[36px] px-[12px]" href={siteHref("/")} rel="noreferrer" target="_blank">
              <Icon name="external" size={16} />
              <span className="hidden sm:inline">View website</span>
            </a>
            <button aria-label="Profile" className="rounded-full lg:hidden" onClick={() => open("profile")} type="button">
              <Avatar admin={admin} size={34} />
            </button>
            <button aria-label="Logout" className="admin-icon-btn lg:hidden" onClick={() => void signOut()} type="button">
              <Icon name="logout" size={16} />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-[16px] pt-[28px] pb-[48px] sm:px-[32px]">
          {!draft ? (
            <p className="text-[15px] text-[var(--admin-muted)]">Loading content…</p>
          ) : DraftSection ? (
            <DraftSection
              actions={draftActions}
              commit={commit}
              content={draft}
              key={`${route.section}-${revision}`}
              onChange={(patch) => {
                setDraft((current) => (current ? { ...current, ...patch } : current))
                setStatus({ kind: "idle" })
              }}
            />
          ) : ManagedSection ? (
            <ManagedSection commit={commit} content={draft} itemId={route.itemId} key={`${route.section}-${revision}`} open={open} />
          ) : route.section === "messages" ? (
            <MessagesSection itemId={route.itemId} onUnreadCount={handleUnread} open={open} />
          ) : route.section === "reviews" ? (
            <ReviewsSection itemId={route.itemId} onPendingCount={handlePendingReviews} open={open} />
          ) : route.section === "profile" ? (
            <ProfileSection admin={admin} onProfileChange={onAdminChange} />
          ) : (
            <DashboardSection admin={admin} content={draft} onOpen={open} />
          )}
        </main>
      </div>

      {toast && (
        <div
          className={`fixed bottom-[24px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[10px] rounded-[4px] px-[16px] py-[11px] text-[14px] font-medium shadow-[0_12px_32px_rgb(16_24_40/22%)] ${
            toast.kind === "saved" ? "bg-[#101828] text-white" : "bg-[#b42318] text-white"
          }`}
          role="status"
        >
          <span aria-hidden="true" className={`size-[8px] rounded-full ${toast.kind === "saved" ? "bg-[#32d583]" : "bg-white"}`} />
          {toast.text}
        </div>
      )}
    </div>
  )
}
