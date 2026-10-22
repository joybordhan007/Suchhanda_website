import { randomBytes } from "node:crypto"
import { createReadStream, existsSync, rmSync, statSync, writeFileSync } from "node:fs"
import { extname, join, resolve, sep } from "node:path"
import { Readable } from "node:stream"
import { getConnInfo } from "@hono/node-server/conninfo"
import { Hono, type Context } from "hono"
import { bodyLimit } from "hono/body-limit"
import {
  createRateLimiter,
  currentAdmin,
  endSession,
  hashPassword,
  requireAdmin,
  sameOrigin,
  startSession,
  verifyPassword,
  type Admin,
} from "./auth.ts"
import { config } from "./config.ts"
import { db } from "./db.ts"
import { metaSettings, publicMetaStatus, saveMetaSettings, sendMetaLead } from "./meta.ts"
import { recordPageView, statsFor } from "./stats.ts"

type Env = { Variables: { admin: Admin } }

const loginLimiter = createRateLimiter(5, 15 * 60 * 1000)
const messageLimiter = createRateLimiter(5, 10 * 60 * 1000)
const reviewLimiter = createRateLimiter(3, 60 * 60 * 1000)
const trackLimiter = createRateLimiter(120, 60 * 1000)

function clientIp(c: Context) {
  if (process.env.TRUST_PROXY === "1") {
    const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim()
    if (forwarded) return forwarded
  }
  try {
    return getConnInfo(c).remote.address ?? "unknown"
  } catch {
    return "unknown"
  }
}

// Rejects script URLs anywhere in saved content (links and image sources are rendered from it).
function containsScriptUrl(value: unknown): boolean {
  if (typeof value === "string") return /^\s*(javascript|vbscript):/i.test(value)
  if (Array.isArray(value)) return value.some(containsScriptUrl)
  if (value && typeof value === "object") return Object.values(value).some(containsScriptUrl)
  return false
}

const imageTypes: { ext: string; type: string; test: (bytes: Buffer) => boolean }[] = [
  { ext: ".png", type: "image/png", test: (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
  { ext: ".jpg", type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: ".gif", type: "image/gif", test: (b) => b.subarray(0, 4).toString("ascii") === "GIF8" },
  {
    ext: ".webp",
    type: "image/webp",
    test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  {
    ext: ".svg",
    type: "image/svg+xml",
    test: (b) => /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(b.subarray(0, 2048).toString("utf8")),
  },
]

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
}

// Returns the file inside `dir` for a URL path, or null if it is missing, malformed or escapes `dir`.
function fileIn(dir: string, urlPath: string) {
  let decoded: string
  try {
    decoded = decodeURIComponent(urlPath)
  } catch {
    return null
  }
  const file = resolve(dir, "." + decoded)
  if (file !== dir && !file.startsWith(dir + sep)) return null
  return existsSync(file) && statSync(file).isFile() ? file : null
}

// Streams a file, answering 304 when the browser already has this version.
function sendFile(c: Context, file: string, headers: Record<string, string> = {}) {
  const stats = statSync(file)
  const lastModified = new Date(Math.floor(stats.mtimeMs / 1000) * 1000)
  const since = c.req.header("if-modified-since")
  const common = { "Last-Modified": lastModified.toUTCString(), ...headers }
  if (since && new Date(since).getTime() >= lastModified.getTime()) {
    return new Response(null, { status: 304, headers: common })
  }
  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream
  return new Response(stream, {
    headers: {
      "Content-Type": contentTypes[extname(file).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": String(stats.size),
      ...common,
    },
  })
}

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "")

const reviewColumns = "id, name, rating, text, image, created_at AS createdAt"

function reviewCounts() {
  const rows = db.prepare("SELECT status, COUNT(*) AS count FROM reviews GROUP BY status").all() as { status: string; count: number }[]
  const count = (status: string) => Number(rows.find((row) => row.status === status)?.count ?? 0)
  return { pending: count("pending"), approved: count("approved"), rejected: count("rejected") }
}

const messageFields: Record<string, string> = {
  firstName: "your first name",
  lastName: "your last name",
  email: "your email",
  phone: "your phone number",
  company: "your company name",
  preferredContactTime: "a preferred contact time",
}

// "_fbp=fb.1.123; other=x" -> value of `name`.
const cookieValue = (header: string | undefined, name: string) =>
  header
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([key]) => key === name)?.[1]

// Host the request was sent to ("admin.example.com"), without the port.
function requestHost(c: Context) {
  const forwarded = process.env.TRUST_PROXY === "1" ? c.req.header("x-forwarded-host")?.split(",")[0]?.trim() : ""
  return (forwarded || c.req.header("host") || new URL(c.req.url).host).replace(/:\d+$/, "").toLowerCase()
}

// Whether this request is for the admin domain, decided by the request host alone: on cPanel
// the admin subdomain's folder sits inside the main site's folder, so requests for either
// domain can reach either app.
function isAdminHost(c: Context) {
  const host = requestHost(c)
  return config.adminUrl ? host === new URL(config.adminUrl).hostname : host.startsWith("admin.")
}

// Website address for links from the admin domain: SITE_URL, else the admin host without "admin.".
function siteUrlFor(c: Context) {
  return config.siteUrl || `https://${requestHost(c).replace(/^admin\./, "")}`
}

export function createApp() {
  const app = new Hono<Env>()

  app.use("*", async (c, next) => {
    await next()
    c.header("X-Content-Type-Options", "nosniff")
    c.header("Referrer-Policy", "strict-origin-when-cross-origin")
    c.header("X-Frame-Options", "SAMEORIGIN")
    // The admin domain should never show up in search results.
    if (isAdminHost(c)) c.header("X-Robots-Tag", "noindex, nofollow")
  })
  app.use("/api/*", sameOrigin)
  app.use("/api/*", async (c, next) => {
    await next()
    c.header("Cache-Control", "no-store")
  })
  // Request size caps: images and the content document are big, everything else is small.
  const tooLarge = (c: Context) => c.json({ error: "The request is too large." }, 413)
  app.use("/api/uploads", bodyLimit({ maxSize: config.maxUploadBytes + 64 * 1024, onError: tooLarge }))
  app.use("/api/content", bodyLimit({ maxSize: config.maxContentBytes, onError: tooLarge }))
  app.use("/api/reviews", bodyLimit({ maxSize: config.maxReviewPhotoBytes + 64 * 1024, onError: tooLarge }))
  app.use("/api/*", async (c, next) => {
    if (c.req.path === "/api/uploads" || c.req.path === "/api/content" || c.req.path === "/api/reviews") return next()
    return bodyLimit({ maxSize: 64 * 1024, onError: tooLarge })(c, next)
  })

  // ---- Content ----------------------------------------------------------
  // For checking a deployment: which host this app saw and how it treats it.
  app.get("/api/health", (c) => c.json({ ok: true, host: requestHost(c), admin: isAdminHost(c), node: process.version }))

  app.get("/api/content", (c) => {
    const row = db.prepare("SELECT json FROM content WHERE id = 1").get() as { json: string } | undefined
    return c.json({ content: row ? JSON.parse(row.json) : null })
  })

  app.put("/api/content", requireAdmin, async (c) => {
    const raw = await c.req.text()
    let content: unknown
    try {
      content = JSON.parse(raw)
    } catch {
      return c.json({ error: "Invalid JSON." }, 400)
    }
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return c.json({ error: "Content must be an object." }, 400)
    }
    if (containsScriptUrl(content)) return c.json({ error: "Script links are not allowed." }, 400)
    const updatedAt = new Date().toISOString()
    const saved = { ...(content as object), updatedAt }
    db.prepare(
      `INSERT INTO content (id, json, updated_at) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
    ).run(JSON.stringify(saved), updatedAt)
    return c.json({ content: saved })
  })

  // ---- Auth -------------------------------------------------------------
  app.post("/api/auth/login", async (c) => {
    const ip = clientIp(c)
    if (loginLimiter.isLimited(ip)) {
      return c.json({ error: "Too many attempts. Try again in 15 minutes." }, 429)
    }
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const email = str(body.email, 200)
    const password = typeof body.password === "string" ? body.password : ""
    const admin = db.prepare("SELECT id, email, name, avatar, password_hash FROM admins WHERE email = ?").get(email) as
      | (Admin & { password_hash: string })
      | undefined
    if (!admin || !(await verifyPassword(password, admin.password_hash))) {
      loginLimiter.hit(ip)
      return c.json({ error: "Wrong email or password." }, 401)
    }
    loginLimiter.reset(ip)
    startSession(c, admin.id)
    return c.json({ admin: { id: admin.id, email: admin.email, name: admin.name, avatar: admin.avatar } })
  })

  app.post("/api/auth/logout", (c) => {
    endSession(c)
    return c.json({ ok: true })
  })

  app.get("/api/auth/me", (c) => {
    const admin = currentAdmin(c)
    return admin ? c.json({ admin }) : c.json({ error: "Not signed in." }, 401)
  })

  app.put("/api/auth/profile", requireAdmin, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const name = str(body.name, 100)
    const avatar = str(body.avatar, 500)
    // Only images on this site (or none) can be used as the profile photo.
    if (avatar && !avatar.startsWith("/uploads/") && !avatar.startsWith("/assets/")) {
      return c.json({ error: "Upload the photo instead of linking to it." }, 400)
    }
    const admin = c.get("admin")
    db.prepare("UPDATE admins SET name = ?, avatar = ? WHERE id = ?").run(name, avatar, admin.id)
    return c.json({ admin: { ...admin, name, avatar } })
  })

  app.post("/api/auth/password", requireAdmin, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const current = typeof body.currentPassword === "string" ? body.currentPassword : ""
    const next = typeof body.newPassword === "string" ? body.newPassword : ""
    if (next.length < 10) return c.json({ error: "The new password needs at least 10 characters." }, 400)
    const admin = c.get("admin")
    const row = db.prepare("SELECT password_hash FROM admins WHERE id = ?").get(admin.id) as { password_hash: string }
    if (!(await verifyPassword(current, row.password_hash))) {
      return c.json({ error: "The current password is wrong." }, 400)
    }
    db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(await hashPassword(next), admin.id)
    // Sign out every other device.
    db.prepare("DELETE FROM sessions WHERE admin_id = ?").run(admin.id)
    startSession(c, admin.id)
    return c.json({ ok: true })
  })

  // ---- Uploads ----------------------------------------------------------
  app.post("/api/uploads", requireAdmin, async (c) => {
    const body = await c.req.parseBody()
    const file = body.file
    if (typeof file !== "object" || !("arrayBuffer" in file)) return c.json({ error: "No file was sent." }, 400)
    if (file.size > config.maxUploadBytes) return c.json({ error: "Images must be 5 MB or smaller." }, 413)
    const bytes = Buffer.from(await file.arrayBuffer())
    const kind = imageTypes.find((type) => type.test(bytes))
    if (!kind) return c.json({ error: "Only PNG, JPG, WebP, GIF or SVG images can be uploaded." }, 400)
    const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}${kind.ext}`
    writeFileSync(join(config.uploadsDir, name), bytes)
    return c.json({ url: `/uploads/${name}` })
  })

  app.get("/uploads/*", (c) => {
    const file = fileIn(config.uploadsDir, c.req.path.slice("/uploads".length))
    if (!file) return c.notFound()
    return sendFile(c, file, {
      "Cache-Control": "public, max-age=31536000, immutable",
      // Uploaded SVGs can contain scripts; never let them run on this site.
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    })
  })

  // ---- Contact messages -------------------------------------------------
  app.post("/api/messages", async (c) => {
    const ip = clientIp(c)
    if (messageLimiter.isLimited(ip)) {
      return c.json({ error: "Too many messages. Please try again later." }, 429)
    }
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    // Hidden field that people never fill in; bots usually do.
    if (str(body.website, 200)) return c.json({ ok: true })
    const message = {
      firstName: str(body.firstName, 100),
      lastName: str(body.lastName, 100),
      email: str(body.email, 200),
      phone: str(body.phone, 50),
      company: str(body.company, 200),
      preferredContactTime: str(body.preferredContactTime, 50),
      message: str(body.message, 5000),
    }
    const missing = Object.keys(messageFields).find((key) => !message[key as keyof typeof message])
    if (missing) return c.json({ error: `Please enter ${messageFields[missing]}.` }, 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) {
      return c.json({ error: "Please enter a valid email." }, 400)
    }
    messageLimiter.hit(ip)
    db.prepare(
      `INSERT INTO messages (first_name, last_name, email, phone, company, preferred_time, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      message.firstName,
      message.lastName,
      message.email,
      message.phone,
      message.company,
      message.preferredContactTime,
      message.message,
      new Date().toISOString(),
    )
    // Server-side copy of the Pixel "Lead" (does nothing until the Conversions API is set up).
    void sendMetaLead({
      eventId: str(body.eventId, 64),
      email: message.email,
      phone: message.phone,
      firstName: message.firstName,
      lastName: message.lastName,
      ip,
      userAgent: c.req.header("user-agent") ?? "",
      sourceUrl: c.req.header("referer") ?? "",
      fbp: cookieValue(c.req.header("cookie"), "_fbp"),
      fbc: cookieValue(c.req.header("cookie"), "_fbc"),
    }).catch(() => undefined)
    return c.json({ ok: true }, 201)
  })

  // ?limit=N returns only the newest N; `unread` always counts every unread message.
  app.get("/api/messages", requireAdmin, (c) => {
    const requested = c.req.query("limit")
    const limit = requested === undefined ? 500 : Math.min(500, Math.max(0, Math.floor(Number(requested)) || 0))
    const rows = db
      .prepare(
        `SELECT id, first_name AS firstName, last_name AS lastName, email, phone, company,
                preferred_time AS preferredContactTime, message, created_at AS createdAt, is_read AS isRead
         FROM messages ORDER BY id DESC LIMIT ?`,
      )
      .all(limit) as Record<string, unknown>[]
    const unread = (db.prepare("SELECT COUNT(*) AS count FROM messages WHERE is_read = 0").get() as { count: number }).count
    return c.json({ messages: rows.map((row) => ({ ...row, isRead: row.isRead === 1 })), unread })
  })

  app.patch("/api/messages/:id", requireAdmin, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    db.prepare("UPDATE messages SET is_read = ? WHERE id = ?").run(body.isRead ? 1 : 0, Number(c.req.param("id")))
    return c.json({ ok: true })
  })

  app.delete("/api/messages/:id", requireAdmin, (c) => {
    db.prepare("DELETE FROM messages WHERE id = ?").run(Number(c.req.param("id")))
    return c.json({ ok: true })
  })

  // ---- Visit statistics ------------------------------------------------
  app.post("/api/track", async (c) => {
    const ip = clientIp(c)
    // Your own browsing while signed in to the dashboard is not counted.
    if (trackLimiter.isLimited(ip) || currentAdmin(c)) return c.body(null, 204)
    trackLimiter.hit(ip)
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    recordPageView({
      path: str(body.path, 200),
      referrer: str(body.referrer, 500),
      landing: body.landing === true,
      ip,
      userAgent: c.req.header("user-agent") ?? "",
      host: c.req.header("host") ?? "",
    })
    return c.body(null, 204)
  })

  app.get("/api/stats", requireAdmin, (c) => {
    const days = Math.min(365, Math.max(7, Number(c.req.query("days")) || 30))
    return c.json({ ...statsFor(days), reviews: reviewCounts() })
  })

  // ---- Reviews ----------------------------------------------------------
  // Approved reviews, newest first, for the website.
  app.get("/api/reviews", (c) => {
    const rows = db
      .prepare(`SELECT ${reviewColumns} FROM reviews WHERE status = 'approved' ORDER BY COALESCE(reviewed_at, created_at) DESC, id DESC LIMIT 500`)
      .all()
    return c.json({ reviews: rows })
  })

  // A visitor's review: name, rating 1–5, text and an optional photo. It waits for approval.
  app.post("/api/reviews", async (c) => {
    const ip = clientIp(c)
    if (reviewLimiter.isLimited(ip)) return c.json({ error: "Too many reviews. Please try again later." }, 429)
    const body = await c.req.parseBody().catch(() => null)
    if (!body) return c.json({ error: "The review could not be read. Please try again." }, 400)
    // Hidden field that people never fill in; bots usually do.
    if (str(body.website, 200)) return c.json({ ok: true }, 201)
    const name = str(body.name, 80)
    const text = str(body.text, 1000)
    const rating = Math.round(Number(body.rating))
    if (!name) return c.json({ error: "Please enter your name." }, 400)
    if (!(rating >= 1 && rating <= 5)) return c.json({ error: "Please choose a rating from 1 to 5 stars." }, 400)
    if (text.length < 10) return c.json({ error: "Please write a few words about your experience." }, 400)
    let image = ""
    const photo = body.photo
    if (typeof photo === "object" && "arrayBuffer" in photo && photo.size > 0) {
      if (photo.size > config.maxReviewPhotoBytes) return c.json({ error: "The photo must be 2 MB or smaller." }, 413)
      const bytes = Buffer.from(await photo.arrayBuffer())
      // Photographs only: SVG is not accepted from visitors.
      const kind = imageTypes.find((type) => type.ext !== ".svg" && type.test(bytes))
      if (!kind) return c.json({ error: "The photo must be a JPG, PNG, WebP or GIF image." }, 400)
      const fileName = `review-${Date.now().toString(36)}-${randomBytes(6).toString("hex")}${kind.ext}`
      writeFileSync(join(config.uploadsDir, fileName), bytes)
      image = `/uploads/${fileName}`
    }
    reviewLimiter.hit(ip)
    db.prepare("INSERT INTO reviews (name, rating, text, image, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)").run(
      name,
      rating,
      text,
      image,
      new Date().toISOString(),
    )
    return c.json({ ok: true }, 201)
  })

  // Every review, for approving in the dashboard.
  app.get("/api/admin/reviews", requireAdmin, (c) => {
    const rows = db.prepare(`SELECT ${reviewColumns}, status FROM reviews ORDER BY id DESC LIMIT 1000`).all()
    return c.json({ reviews: rows, counts: reviewCounts() })
  })

  app.patch("/api/admin/reviews/:id", requireAdmin, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const status = body.status
    if (status !== "approved" && status !== "rejected" && status !== "pending") return c.json({ error: "Unknown status." }, 400)
    db.prepare("UPDATE reviews SET status = ?, reviewed_at = ? WHERE id = ?").run(status, new Date().toISOString(), Number(c.req.param("id")))
    return c.json({ ok: true, counts: reviewCounts() })
  })

  app.delete("/api/admin/reviews/:id", requireAdmin, (c) => {
    const id = Number(c.req.param("id"))
    const row = db.prepare("SELECT image FROM reviews WHERE id = ?").get(id) as { image: string } | undefined
    db.prepare("DELETE FROM reviews WHERE id = ?").run(id)
    // The photo belongs to the review alone, so it goes with it.
    const photo = row?.image.startsWith("/uploads/review-") ? fileIn(config.uploadsDir, row.image.slice("/uploads".length)) : null
    if (photo) rmSync(photo, { force: true })
    return c.json({ ok: true, counts: reviewCounts() })
  })

  // ---- Tracking (private part) -----------------------------------------
  // The Conversions API token stays on the server; the dashboard only learns whether it is set.
  app.get("/api/tracking", requireAdmin, (c) => c.json({ meta: publicMetaStatus() }))

  app.put("/api/tracking/meta", requireAdmin, async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const current = metaSettings()
    // accessToken: a string replaces it, null removes it, missing keeps it.
    const accessToken = body.accessToken === null ? "" : typeof body.accessToken === "string" ? body.accessToken.trim() : current.accessToken
    if (accessToken && !/^[A-Za-z0-9_-]{20,500}$/.test(accessToken)) {
      return c.json({ error: "That does not look like a Meta access token." }, 400)
    }
    const testEventCode = str(body.testEventCode, 40)
    if (testEventCode && !/^[A-Za-z0-9]+$/.test(testEventCode)) return c.json({ error: "Test event codes contain only letters and numbers." }, 400)
    saveMetaSettings({ accessToken, testEventCode })
    return c.json({ meta: publicMetaStatus() })
  })

  app.all("/api/*", (c) => c.json({ error: "Not found." }, 404))

  // ---- Website (production) --------------------------------------------
  // Serves the built site; any other path gets index.html so the app can route it.
  app.get("*", (c) => {
    const indexFile = join(config.distDir, "index.html")
    if (!existsSync(indexFile)) return c.text("Website build not found. Run `pnpm build`.", 404)
    const path = c.req.path
    const file = path === "/" ? null : fileIn(config.distDir, path)
    const isAdminPage = path === "/admin" || path.startsWith("/admin/")
    const adminHost = isAdminHost(c)
    if (config.adminUrl && isAdminPage && !adminHost) return c.redirect(`${config.adminUrl}${path}`, 302)
    if (adminHost && !isAdminPage && !file) {
      return c.redirect(path === "/" ? "/admin" : `${siteUrlFor(c)}${path}`, 302)
    }
    if (file) {
      const hashed = c.req.path.startsWith("/assets/index-") || /-[A-Za-z0-9_-]{8}\.(js|css)$/.test(file)
      return sendFile(c, file, { "Cache-Control": hashed ? "public, max-age=31536000, immutable" : "public, max-age=3600" })
    }
    return sendFile(c, indexFile, { "Cache-Control": "no-cache" })
  })

  return app
}
