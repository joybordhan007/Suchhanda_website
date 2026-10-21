"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sameOrigin = exports.requireAdmin = void 0;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.startSession = startSession;
exports.endSession = endSession;
exports.currentAdmin = currentAdmin;
exports.deleteExpiredSessions = deleteExpiredSessions;
exports.createRateLimiter = createRateLimiter;
const node_crypto_1 = require("node:crypto");
const node_util_1 = require("node:util");
const cookie_1 = require("hono/cookie");
const config_ts_1 = require("./config.ts");
const db_ts_1 = require("./db.ts");
const scryptAsync = (0, node_util_1.promisify)(node_crypto_1.scrypt);
const SESSION_COOKIE = "sid";
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = (0, node_crypto_1.randomBytes)(16);
        const hash = yield scryptAsync(password, salt, 64);
        return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
    });
}
function verifyPassword(password, stored) {
    return __awaiter(this, void 0, void 0, function* () {
        const [scheme, saltB64, hashB64] = stored.split("$");
        if (scheme !== "scrypt" || !saltB64 || !hashB64)
            return false;
        const expected = Buffer.from(hashB64, "base64");
        const actual = yield scryptAsync(password, Buffer.from(saltB64, "base64"), expected.length);
        return (0, node_crypto_1.timingSafeEqual)(actual, expected);
    });
}
const hashToken = (token) => (0, node_crypto_1.createHash)("sha256").update(token).digest("hex");
function startSession(c, adminId) {
    const token = (0, node_crypto_1.randomBytes)(32).toString("base64url");
    const maxAge = config_ts_1.config.sessionDays * 24 * 60 * 60;
    db_ts_1.db.prepare("INSERT INTO sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)").run(hashToken(token), adminId, Date.now() + maxAge * 1000);
    (0, cookie_1.setCookie)(c, SESSION_COOKIE, token, {
        httpOnly: true,
        secure: config_ts_1.config.isProduction,
        sameSite: "Lax",
        path: "/",
        maxAge,
    });
}
function endSession(c) {
    const token = (0, cookie_1.getCookie)(c, SESSION_COOKIE);
    if (token)
        db_ts_1.db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
    (0, cookie_1.deleteCookie)(c, SESSION_COOKIE, { path: "/" });
}
function currentAdmin(c) {
    const token = (0, cookie_1.getCookie)(c, SESSION_COOKIE);
    if (!token)
        return null;
    const row = db_ts_1.db
        .prepare(`SELECT admins.id, admins.email, admins.name, admins.avatar, sessions.expires_at FROM sessions
       JOIN admins ON admins.id = sessions.admin_id WHERE sessions.token_hash = ?`)
        .get(hashToken(token));
    if (!row)
        return null;
    if (row.expires_at < Date.now()) {
        db_ts_1.db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
        return null;
    }
    return { id: row.id, email: row.email, name: row.name, avatar: row.avatar };
}
function deleteExpiredSessions() {
    db_ts_1.db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
}
const requireAdmin = (c, next) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = currentAdmin(c);
    if (!admin)
        return c.json({ error: "Not signed in." }, 401);
    c.set("admin", admin);
    yield next();
});
exports.requireAdmin = requireAdmin;
// Blocks requests that change data when they come from another website.
const sameOrigin = (c, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
        const origin = c.req.header("origin");
        const forwardedHost = process.env.TRUST_PROXY === "1" ? c.req.header("x-forwarded-host") : undefined;
        const host = forwardedHost !== null && forwardedHost !== void 0 ? forwardedHost : c.req.header("host");
        let originHost = null;
        try {
            originHost = origin ? new URL(origin).host : null;
        }
        catch (_a) {
            // "null" or a malformed origin: treat as another site.
            originHost = "";
        }
        if (originHost !== null && host && originHost !== host) {
            return c.json({ error: "Cross-site request blocked." }, 403);
        }
    }
    yield next();
});
exports.sameOrigin = sameOrigin;
// Simple in-memory limiter: at most `limit` hits per key within `windowMs`.
function createRateLimiter(limit, windowMs) {
    const hits = new Map();
    // Forget idle keys now and then, so the map cannot grow without limit.
    setInterval(() => {
        const now = Date.now();
        for (const [key, times] of hits)
            if (times.every((time) => now - time >= windowMs))
                hits.delete(key);
    }, windowMs).unref();
    return {
        isLimited(key) {
            var _a;
            const now = Date.now();
            const recent = ((_a = hits.get(key)) !== null && _a !== void 0 ? _a : []).filter((time) => now - time < windowMs);
            hits.set(key, recent);
            return recent.length >= limit;
        },
        hit(key) {
            var _a;
            const recent = (_a = hits.get(key)) !== null && _a !== void 0 ? _a : [];
            recent.push(Date.now());
            hits.set(key, recent);
        },
        reset(key) {
            hits.delete(key);
        },
    };
}
