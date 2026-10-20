import { randomBytes } from "node:crypto"
import { existsSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs"
import { extname, join, resolve, sep } from "node:path"
import { getConnInfo } from "@hono/node-server/conninfo"
import { Hono, type Context } from "hono"
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

type Env = { Variables: { admin: Admin } }

const loginLimiter = createRateLimiter(5, 15 * 60 * 1000)
const messageLimiter = createRateLimiter(5, 10 * 60 * 1000)

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

// Returns the file inside `dir` for a URL path, or null if it is missing or escapes `dir`.
function fileIn(dir: string, urlPath: string) {
  const file = resolve(dir, "." + decodeURIComponent(urlPath))
  if (file !== dir && !file.startsWith(dir + sep)) return null
  return existsSync(file) && statSync(file).isFile() ? file : null
}

function sendFile(file: string, headers: Record<string, string> = {}) {
  return new Response(readFileSync(file), {
    headers: { "Content-Type": contentTypes[extname(file).toLowerCase()] ?? "application/octet-stream", ...headers },
  })
}

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "")

export function createApp() {
  const app = new Hono<Env>()

  app.use("/api/*", sameOrigin)
  app.use("/api/*", async (c, next) => {
    await next()
    c.header("Cache-Control", "no-store")
  })

  // ---- Content ----------------------------------------------------------
  app.get("/api/content", (c) => {
    const row = db.prepare("SELECT json FROM content WHERE id = 1").get() as { json: string } | undefined
    return c.json({ content: row ? JSON.parse(row.json) : null })
  })

  app.put("/api/content", requireAdmin, async (c) => {
    const raw = await c.req.text()
    if (raw.length > config.maxContentBytes) return c.json({ error: "Content is too large." }, 413)
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
    const admin = db.prepare("SELECT id, email, password_hash FROM admins WHERE email = ?").get(email) as
      | { id: number; email: string; password_hash: string }
      | undefined
    if (!admin || !(await verifyPassword(password, admin.password_hash))) {
      loginLimiter.hit(ip)
      return c.json({ error: "Wrong email or password." }, 401)
    }
    loginLimiter.reset(ip)
    startSession(c, admin.id)
    return c.json({ admin: { id: admin.id, email: admin.email } })
  })

  app.post("/api/auth/logout", (c) => {
    endSession(c)
    return c.json({ ok: true })
  })

  app.get("/api/auth/me", (c) => {
    const admin = currentAdmin(c)
    return admin ? c.json({ admin }) : c.json({ error: "Not signed in." }, 401)
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
    if (!(file instanceof File)) return c.json({ error: "No file was sent." }, 400)
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
    return sendFile(file, {
      "Cache-Control": "public, max-age=31536000, immutable",
      // Uploaded SVGs can contain scripts; never let them run on this site.
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    })
  })

  app.delete("/api/uploads/:name", requireAdmin, (c) => {
    const file = fileIn(config.uploadsDir, "/" + c.req.param("name"))
    if (file) unlinkSync(file)
    return c.json({ ok: true })
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
    const missing = Object.entries(message).find(([key, value]) => key !== "message" && !value)
    if (missing) return c.json({ error: `Please fill in ${missing[0]}.` }, 400)
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
    return c.json({ ok: true }, 201)
  })

  app.get("/api/messages", requireAdmin, (c) => {
    const rows = db
      .prepare(
        `SELECT id, first_name AS firstName, last_name AS lastName, email, phone, company,
                preferred_time AS preferredContactTime, message, created_at AS createdAt, is_read AS isRead
         FROM messages ORDER BY id DESC LIMIT 500`,
      )
      .all() as Record<string, unknown>[]
    return c.json({ messages: rows.map((row) => ({ ...row, isRead: row.isRead === 1 })) })
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

  app.all("/api/*", (c) => c.json({ error: "Not found." }, 404))

  // ---- Website (production) --------------------------------------------
  // Serves the built site; any other path gets index.html so the app can route it.
  app.get("*", (c) => {
    const indexFile = join(config.distDir, "index.html")
    if (!existsSync(indexFile)) return c.text("Website build not found. Run `pnpm build`.", 404)
    const file = c.req.path === "/" ? null : fileIn(config.distDir, c.req.path)
    if (file) {
      const hashed = c.req.path.startsWith("/assets/index-") || /-[A-Za-z0-9_-]{8}\.(js|css)$/.test(file)
      return sendFile(file, { "Cache-Control": hashed ? "public, max-age=31536000, immutable" : "public, max-age=3600" })
    }
    return sendFile(indexFile, { "Cache-Control": "no-cache" })
  })

  return app
}
