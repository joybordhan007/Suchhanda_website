import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import type { Context, MiddlewareHandler } from "hono"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { config } from "./config.ts"
import { db } from "./db.ts"

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>

const SESSION_COOKIE = "sid"

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const hash = await scryptAsync(password, salt, 64)
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, hashB64] = stored.split("$")
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false
  const expected = Buffer.from(hashB64, "base64")
  const actual = await scryptAsync(password, Buffer.from(saltB64, "base64"), expected.length)
  return timingSafeEqual(actual, expected)
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

export function startSession(c: Context, adminId: number) {
  const token = randomBytes(32).toString("base64url")
  const maxAge = config.sessionDays * 24 * 60 * 60
  db.prepare("INSERT INTO sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)").run(
    hashToken(token),
    adminId,
    Date.now() + maxAge * 1000,
  )
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "Lax",
    path: "/",
    maxAge,
  })
}

export function endSession(c: Context) {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token))
  deleteCookie(c, SESSION_COOKIE, { path: "/" })
}

export type Admin = { id: number; email: string }

export function currentAdmin(c: Context): Admin | null {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return null
  const row = db
    .prepare(
      `SELECT admins.id, admins.email, sessions.expires_at FROM sessions
       JOIN admins ON admins.id = sessions.admin_id WHERE sessions.token_hash = ?`,
    )
    .get(hashToken(token)) as { id: number; email: string; expires_at: number } | undefined
  if (!row) return null
  if (row.expires_at < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token))
    return null
  }
  return { id: row.id, email: row.email }
}

export function deleteExpiredSessions() {
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now())
}

export const requireAdmin: MiddlewareHandler<{ Variables: { admin: Admin } }> = async (c, next) => {
  const admin = currentAdmin(c)
  if (!admin) return c.json({ error: "Not signed in." }, 401)
  c.set("admin", admin)
  await next()
}

// Blocks requests that change data when they come from another website.
export const sameOrigin: MiddlewareHandler = async (c, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    const origin = c.req.header("origin")
    const forwardedHost = process.env.TRUST_PROXY === "1" ? c.req.header("x-forwarded-host") : undefined
    const host = forwardedHost ?? c.req.header("host")
    if (origin && host && new URL(origin).host !== host) {
      return c.json({ error: "Cross-site request blocked." }, 403)
    }
  }
  await next()
}

// Simple in-memory limiter: at most `limit` hits per key within `windowMs`.
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>()
  return {
    isLimited(key: string) {
      const now = Date.now()
      const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)
      hits.set(key, recent)
      return recent.length >= limit
    },
    hit(key: string) {
      const recent = hits.get(key) ?? []
      recent.push(Date.now())
      hits.set(key, recent)
    },
    reset(key: string) {
      hits.delete(key)
    },
  }
}
