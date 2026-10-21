import { createHash, randomBytes } from "node:crypto"
import { db } from "./db.ts"

// Secret mixed into visitor hashes so they can't be reversed into IP addresses.
function hashSecret() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'visitor_secret'").get() as { value: string } | undefined
  if (row) return row.value
  const value = randomBytes(32).toString("hex")
  db.prepare("INSERT INTO settings (key, value) VALUES ('visitor_secret', ?)").run(value)
  return value
}

const secret = hashSecret()
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios/i
const RETENTION_DAYS = 400
const INTERNAL_SOURCE = "(internal)"

const today = () => new Date().toISOString().slice(0, 10)

// "https://www.google.com/search?q=…" -> "google.com"; same-site and empty -> "Direct".
function sourceOf(referrer: string, ownHost: string) {
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "")
    if (!host || host === ownHost.replace(/^www\./, "").split(":")[0]) return "Direct"
    if (/(^|\.)(facebook|fb|instagram|messenger)\.com$|^l\.facebook\.com$|^lm\.facebook\.com$/.test(host)) return "Facebook / Instagram"
    if (/(^|\.)google\./.test(host)) return "Google"
    if (/(^|\.)linkedin\.com$|^lnkd\.in$/.test(host)) return "LinkedIn"
    if (/(^|\.)(t\.co|x\.com|twitter\.com)$/.test(host)) return "X (Twitter)"
    if (/(^|\.)(bing|duckduckgo|yahoo)\./.test(host)) return "Other search"
    return host
  } catch {
    return "Direct"
  }
}

export function recordPageView({
  path,
  referrer,
  landing,
  ip,
  userAgent,
  host,
}: {
  path: string
  referrer: string
  // First page of a visit; later pages are moves within the site and have no source.
  landing: boolean
  ip: string
  userAgent: string
  host: string
}) {
  if (!userAgent || BOT_PATTERN.test(userAgent)) return false
  if (!/^\/[a-z0-9\-/]{0,200}$/.test(path) || path.startsWith("/admin")) return false
  const day = today()
  const visitor = createHash("sha256").update(`${secret}|${day}|${ip}|${userAgent}`).digest("hex").slice(0, 20)
  db.prepare("INSERT INTO page_views (day, path, source, visitor, created_at) VALUES (?, ?, ?, ?, ?)").run(
    day,
    path,
    landing ? sourceOf(referrer, host) : INTERNAL_SOURCE,
    visitor,
    new Date().toISOString(),
  )
  return true
}

export function pruneOldPageViews() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000).toISOString().slice(0, 10)
  db.prepare("DELETE FROM page_views WHERE day < ?").run(cutoff)
}

function dayList(days: number, endOffset = 0) {
  const list: string[] = []
  for (let index = days - 1; index >= 0; index--) {
    list.push(new Date(Date.now() - (index + endOffset) * 86_400_000).toISOString().slice(0, 10))
  }
  return list
}

type Totals = { views: number; visitors: number; messages: number }

function totals(from: string, to: string): Totals {
  const views = db
    .prepare("SELECT COUNT(*) AS views, COUNT(DISTINCT day || visitor) AS visitors FROM page_views WHERE day BETWEEN ? AND ?")
    .get(from, to) as { views: number; visitors: number }
  const messages = db
    .prepare("SELECT COUNT(*) AS count FROM messages WHERE substr(created_at, 1, 10) BETWEEN ? AND ?")
    .get(from, to) as { count: number }
  return { views: views.views, visitors: views.visitors, messages: messages.count }
}

// Everything the dashboard shows for the last `days` days, plus the period before
// it for comparison.
export function statsFor(days: number) {
  const current = dayList(days)
  const previous = dayList(days, days)
  const from = current[0]
  const to = current[current.length - 1]

  const viewRows = db
    .prepare("SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM page_views WHERE day BETWEEN ? AND ? GROUP BY day")
    .all(from, to) as { day: string; views: number; visitors: number }[]
  const messageRows = db
    .prepare("SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS messages FROM messages WHERE substr(created_at, 1, 10) BETWEEN ? AND ? GROUP BY day")
    .all(from, to) as { day: string; messages: number }[]
  const viewsByDay = new Map(viewRows.map((row) => [row.day, row]))
  const messagesByDay = new Map(messageRows.map((row) => [row.day, row.messages]))

  const firstDay = (db.prepare("SELECT MIN(day) AS day FROM page_views").get() as { day: string | null }).day

  return {
    days,
    trackingSince: firstDay,
    daily: current.map((day) => ({
      day,
      views: viewsByDay.get(day)?.views ?? 0,
      visitors: viewsByDay.get(day)?.visitors ?? 0,
      messages: messagesByDay.get(day) ?? 0,
    })),
    totals: totals(from, to),
    previousTotals: totals(previous[0], previous[previous.length - 1]),
    topPages: db
      .prepare("SELECT path, COUNT(*) AS views FROM page_views WHERE day BETWEEN ? AND ? GROUP BY path ORDER BY views DESC LIMIT 8")
      .all(from, to) as { path: string; views: number }[],
    sources: db
      .prepare("SELECT source, COUNT(*) AS views FROM page_views WHERE day BETWEEN ? AND ? AND source != ? GROUP BY source ORDER BY views DESC LIMIT 6")
      .all(from, to, INTERNAL_SOURCE) as { source: string; views: number }[],
    unreadMessages: (db.prepare("SELECT COUNT(*) AS count FROM messages WHERE is_read = 0").get() as { count: number }).count,
  }
}
