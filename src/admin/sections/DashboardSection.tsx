import { useEffect, useState } from "react"
import { api } from "../../content/api"
import type { ContactMessage, SiteContent } from "../../content/types"
import BarList from "../charts/BarList"
import ChartCard from "../charts/ChartCard"
import ColumnChart from "../charts/ColumnChart"
import LineChart from "../charts/LineChart"
import StatTile from "../charts/StatTile"
import { compact, shortDate } from "../charts/chartUtils"
import Icon from "../components/Icon"
import { formatDateTime, formatId } from "../format"
import type { AdminUser } from "../LoginPage"

type Stats = {
  days: number
  trackingSince: string | null
  daily: { day: string; views: number; visitors: number; messages: number }[]
  totals: { views: number; visitors: number; messages: number }
  previousTotals: { views: number; visitors: number; messages: number }
  topPages: { path: string; views: number }[]
  sources: { source: string; views: number }[]
  unreadMessages: number
  reviews: { pending: number; approved: number; rejected: number }
}

type DashboardSectionProps = {
  admin: AdminUser
  content: SiteContent
  onOpen: (section: string, itemId?: string) => void
}

const RANGES = [
  { days: 7, label: "7D", title: "Last 7 days" },
  { days: 30, label: "30D", title: "Last 30 days" },
  { days: 90, label: "90D", title: "Last 90 days" },
  { days: 365, label: "12M", title: "Last 12 months" },
] as const

type RangeDays = (typeof RANGES)[number]["days"]

const change = (current: number, previous: number) => (previous > 0 ? (current - previous) / previous : null)

const pageName = (path: string, content: SiteContent) => {
  if (path === "/") return "Home"
  const service = content.services.find((item) => `/service/${item.slug}` === path)
  if (service) return `Service · ${service.title}`
  const post = content.blog.find((item) => `/blog/${item.slug}` === path)
  if (post) return `Blog · ${post.title}`
  const names: Record<string, string> = {
    "/work": "Work",
    "/about": "About Me",
    "/blog": "Blog",
    "/contact": "Contact",
    "/service": "Service",
    "/privacy-policy": "Privacy Policy",
    "/terms-of-service": "Terms of Service",
  }
  return names[path] ?? path
}

// Groups daily rows into weeks or months for long ranges, so columns stay readable.
function bucket(daily: Stats["daily"], size: number) {
  const buckets: { label: string; messages: number }[] = []
  for (let index = daily.length; index > 0; index -= size) {
    const slice = daily.slice(Math.max(0, index - size), index)
    buckets.unshift({
      label: size === 1 ? shortDate(slice[0].day) : `${shortDate(slice[0].day)}`,
      messages: slice.reduce((sum, row) => sum + row.messages, 0),
    })
  }
  return buckets
}

function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
}

function Meter({ label, value, total, onClick }: { label: string; value: number; total: number; onClick: () => void }) {
  const share = total ? value / total : 0
  return (
    <button className="flex w-full flex-col gap-[8px] rounded-[4px] px-[10px] py-[10px] text-left transition hover:bg-[#f9fafb]" onClick={onClick} type="button">
      <span className="flex items-baseline justify-between gap-[8px] text-[13px]">
        <span className="font-medium text-[var(--admin-text)]">{label}</span>
        <span className="text-[var(--admin-muted)] [font-variant-numeric:tabular-nums]">
          <span className="font-semibold text-[var(--admin-text)]">{value}</span> / {total} live
        </span>
      </span>
      <span className="h-[6px] w-full overflow-hidden rounded-[4px] bg-[#f2f4f7]">
        <span className="block h-full rounded-[4px] bg-[var(--chart-visitors)]" style={{ width: `${share * 100}%` }} />
      </span>
    </button>
  )
}

export default function DashboardSection({ admin, content, onOpen }: DashboardSectionProps) {
  const [days, setDays] = useState<RangeDays>(30)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [messages, setMessages] = useState<ContactMessage[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api<Stats>(`/stats?days=${days}`)
      .then((next) => {
        if (cancelled) return
        setStats(next)
        setError("")
      })
      .catch((loadError) => !cancelled && setError(loadError instanceof Error ? loadError.message : "Could not load statistics."))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [days])

  useEffect(() => {
    api<{ messages: ContactMessage[] }>("/messages?limit=5")
      .then(({ messages: list }) => setMessages(list))
      .catch(() => setMessages([]))
  }, [])

  const range = RANGES.find((item) => item.days === days) ?? RANGES[1]
  const periodLabel = days === 365 ? "vs previous 12 months" : `vs previous ${days} days`
  const totals = stats?.totals ?? { views: 0, visitors: 0, messages: 0 }
  const previous = stats?.previousTotals ?? { views: 0, visitors: 0, messages: 0 }
  const rate = totals.visitors ? totals.messages / totals.visitors : 0
  const previousRate = previous.visitors ? previous.messages / previous.visitors : 0
  const daily = stats?.daily ?? []
  const recent = daily.slice(-14)
  const bucketSize = days === 365 ? 30 : days === 90 ? 7 : 1
  const bucketName = bucketSize === 30 ? "month" : bucketSize === 7 ? "week" : "day"
  const columns = bucket(daily, bucketSize)
  const liveServices = content.services.filter((service) => service.active).length
  const liveWork = content.work.filter((item) => item.active).length
  const livePosts = content.blog.filter((post) => post.status === "published").length

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex flex-wrap items-end justify-between gap-[16px]">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--admin-text)]">
            {greeting()}
            {admin.name ? `, ${admin.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-[4px] text-[15px] text-[var(--admin-muted)]">Here is how your website is doing.</p>
        </div>
        {/* One filter scopes every number and chart below it. */}
        <div className="flex flex-col items-end gap-[6px]">
          <div aria-label="Date range" className="flex rounded-[4px] border border-[var(--admin-border)] bg-white p-[3px] shadow-[0_1px_2px_rgb(16_24_40/4%)]" role="group">
            {RANGES.map((option) => (
              <button
                aria-pressed={days === option.days}
                className={`h-[30px] min-w-[48px] rounded-[4px] px-[12px] text-[13px] font-semibold transition ${
                  days === option.days ? "bg-[var(--admin-navy)] text-white" : "text-[var(--admin-text-2)] hover:bg-[#f2f4f7]"
                }`}
                key={option.days}
                onClick={() => setDays(option.days)}
                title={option.title}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="text-[12px] text-[var(--admin-muted)]">
            {range.title}
            {stats?.trackingSince ? ` · counted since ${shortDate(stats.trackingSince)}` : ""}
          </span>
        </div>
      </div>

      {error && <p className="rounded-[4px] border border-[#fecdca] bg-[#fef3f2] px-[16px] py-[12px] text-[14px] text-[#b42318]">{error}</p>}
      {stats && !stats.trackingSince && (
        <p className="admin-card flex items-center gap-[10px] px-[16px] py-[12px] text-[14px] text-[var(--admin-text-2)]">
          <Icon className="text-[var(--admin-gold)]" name="trending" />
          Visit statistics start now. Charts fill in as people visit the website — your own visits while signed in are not counted.
        </p>
      )}

      <div className={`flex flex-col gap-[24px] transition-opacity ${loading && stats ? "opacity-60" : ""}`}>
        <div className="grid gap-[16px] sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            accent="var(--chart-visitors)"
            delta={change(totals.visitors, previous.visitors)}
            icon="users"
            label="Visitors"
            periodLabel={periodLabel}
            trend={recent.map((row) => row.visitors)}
            value={compact(totals.visitors)}
          />
          <StatTile
            accent="var(--chart-views)"
            delta={change(totals.views, previous.views)}
            icon="eye"
            label="Page views"
            periodLabel={periodLabel}
            trend={recent.map((row) => row.views)}
            value={compact(totals.views)}
          />
          <StatTile
            accent="var(--chart-inquiries)"
            delta={change(totals.messages, previous.messages)}
            icon="messages"
            label="Inquiries"
            periodLabel={periodLabel}
            trend={recent.map((row) => row.messages)}
            value={compact(totals.messages)}
          />
          <StatTile
            accent="var(--admin-gold)"
            delta={change(rate, previousRate)}
            icon="trending"
            label="Conversion rate"
            periodLabel={periodLabel}
            value={`${(rate * 100).toFixed(rate && rate < 0.1 ? 1 : 0)}%`}
          />
        </div>

        <div className="grid gap-[16px] xl:grid-cols-3">
          <ChartCard
            className="xl:col-span-2"
            legend={[
              { label: "Visitors", color: "var(--chart-visitors)" },
              { label: "Page views", color: "var(--chart-views)" },
            ]}
            subtitle={`Daily · ${range.title.toLowerCase()}`}
            table={{ headers: ["Day", "Visitors", "Page views"], rows: [...daily].reverse().map((row) => [shortDate(row.day), row.visitors, row.views]) }}
            title="Traffic"
          >
            <LineChart
              days={daily.map((row) => row.day)}
              series={[
                { key: "visitors", label: "Visitors", color: "var(--chart-visitors)", values: daily.map((row) => row.visitors) },
                { key: "views", label: "Page views", color: "var(--chart-views)", values: daily.map((row) => row.views) },
              ]}
            />
          </ChartCard>
          <ChartCard
            subtitle={`Contact form, per ${bucketName}`}
            table={{ headers: [bucketSize === 1 ? "Day" : bucketSize === 7 ? "Week of" : "Month from", "Inquiries"], rows: [...columns].reverse().map((column) => [column.label, column.messages]) }}
            title="Inquiries"
          >
            <ColumnChart color="var(--chart-inquiries)" labels={columns.map((column) => column.label)} valueLabel="inquiries" values={columns.map((column) => column.messages)} />
          </ChartCard>
        </div>

        <div className="grid gap-[16px] lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            subtitle="Most viewed pages"
            table={{ headers: ["Page", "Views"], rows: (stats?.topPages ?? []).map((row) => [pageName(row.path, content), row.views]) }}
            title="Top pages"
          >
            <BarList
              color="var(--chart-views)"
              empty="No page views yet in this period."
              items={(stats?.topPages ?? []).map((row) => ({ label: pageName(row.path, content), value: row.views }))}
              valueLabel="views"
            />
          </ChartCard>
          <ChartCard
            subtitle="Where visits come from"
            table={{ headers: ["Source", "Visits"], rows: (stats?.sources ?? []).map((row) => [row.source, row.views]) }}
            title="Traffic sources"
          >
            <BarList
              color="var(--chart-visitors)"
              empty="No visits yet in this period."
              items={(stats?.sources ?? []).map((row) => ({ label: row.source, value: row.views }))}
              valueLabel="visits"
            />
          </ChartCard>
          <section className="admin-card flex flex-col lg:col-span-2 xl:col-span-1">
            <div className="border-b border-[var(--admin-border)] px-[20px] py-[14px]">
              <h2 className="text-[15px] font-semibold">Website content</h2>
              <p className="mt-[2px] text-[12px] text-[var(--admin-muted)]">What visitors can see right now</p>
            </div>
            <div className="flex flex-col gap-[2px] px-[10px] pt-[10px]">
              <Meter label="Services" onClick={() => onOpen("services")} total={content.services.length} value={liveServices} />
              <Meter label="Work" onClick={() => onOpen("work")} total={content.work.length} value={liveWork} />
              <Meter label="Blog posts" onClick={() => onOpen("blog")} total={content.blog.length} value={livePosts} />
            </div>
            <div className="grid grid-cols-2 gap-[8px] p-[20px] pt-[10px]">
              <button className="rounded-[4px] border border-[var(--admin-border)] bg-[#fcfcfd] p-[14px] text-left transition hover:border-[var(--admin-gold)] hover:bg-white" onClick={() => onOpen("logos")} type="button">
                <span className="block text-[24px] font-semibold leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums]">{content.clientLogos.length}</span>
                <span className="mt-[6px] block text-[12px] text-[var(--admin-muted)]">Client logos</span>
              </button>
              <button className="rounded-[4px] border border-[var(--admin-border)] bg-[#fcfcfd] p-[14px] text-left transition hover:border-[var(--admin-gold)] hover:bg-white" onClick={() => onOpen("reviews")} type="button">
                <span className="block text-[24px] font-semibold leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums]">{stats?.reviews.approved ?? "–"}</span>
                <span className="mt-[6px] block text-[12px] text-[var(--admin-muted)]">
                  Reviews live
                  {(stats?.reviews.pending ?? 0) > 0 && <span className="font-semibold text-[var(--admin-gold-ink)]"> · {stats?.reviews.pending} waiting</span>}
                </span>
              </button>
            </div>
          </section>
        </div>

        <section className="admin-card overflow-hidden">
          <div className="flex items-center justify-between gap-[12px] px-[20px] py-[14px]">
            <div>
              <h2 className="text-[15px] font-semibold">Latest messages</h2>
              <p className="mt-[2px] text-[12px] text-[var(--admin-muted)]">
                {stats ? `${stats.unreadMessages} unread` : "Inquiries from the Contact page"}
              </p>
            </div>
            <button className="admin-btn admin-btn-ghost h-[34px]" onClick={() => onOpen("messages")} type="button">
              View all
            </button>
          </div>
          {messages.length === 0 ? (
            <p className="border-t border-[var(--admin-border)] px-[20px] py-[24px] text-center text-[14px] text-[var(--admin-muted)]">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--admin-border)] border-t border-[var(--admin-border)]">
              {messages.map((message) => (
                <li key={message.id}>
                  <button
                    className="flex w-full items-center gap-[12px] px-[20px] py-[12px] text-left transition hover:bg-[#f9fafb]"
                    onClick={() => onOpen("messages", String(message.id))}
                    type="button"
                  >
                    <span className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-[#f2f4f7] text-[14px] font-semibold text-[var(--admin-text-2)]">
                      {message.firstName.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-[8px]">
                        <span className={`truncate text-[14px] ${message.isRead ? "font-medium" : "font-semibold"}`}>
                          {message.firstName} {message.lastName}
                        </span>
                        {!message.isRead && <span className="admin-badge bg-[#fdf6e9] text-[var(--admin-gold-ink)]">New</span>}
                      </span>
                      <span className="block truncate text-[13px] text-[var(--admin-muted)]">{message.message || message.company}</span>
                    </span>
                    <span className="hidden shrink-0 text-right text-[12px] text-[var(--admin-muted)] sm:block">
                      {formatId("MSG", message.id)}
                      <br />
                      {formatDateTime(message.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
