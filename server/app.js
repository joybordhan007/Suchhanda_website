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
exports.createApp = createApp;
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_stream_1 = require("node:stream");
const conninfo_1 = require("@hono/node-server/conninfo");
const hono_1 = require("hono");
const body_limit_1 = require("hono/body-limit");
const auth_ts_1 = require("./auth.ts");
const config_ts_1 = require("./config.ts");
const db_ts_1 = require("./db.ts");
const meta_ts_1 = require("./meta.ts");
const stats_ts_1 = require("./stats.ts");
const loginLimiter = (0, auth_ts_1.createRateLimiter)(5, 15 * 60 * 1000);
const messageLimiter = (0, auth_ts_1.createRateLimiter)(5, 10 * 60 * 1000);
const trackLimiter = (0, auth_ts_1.createRateLimiter)(120, 60 * 1000);
function clientIp(c) {
    var _a, _b, _c;
    if (process.env.TRUST_PROXY === "1") {
        const forwarded = (_b = (_a = c.req.header("x-forwarded-for")) === null || _a === void 0 ? void 0 : _a.split(",")[0]) === null || _b === void 0 ? void 0 : _b.trim();
        if (forwarded)
            return forwarded;
    }
    try {
        return (_c = (0, conninfo_1.getConnInfo)(c).remote.address) !== null && _c !== void 0 ? _c : "unknown";
    }
    catch (_d) {
        return "unknown";
    }
}
// Rejects script URLs anywhere in saved content (links and image sources are rendered from it).
function containsScriptUrl(value) {
    if (typeof value === "string")
        return /^\s*(javascript|vbscript):/i.test(value);
    if (Array.isArray(value))
        return value.some(containsScriptUrl);
    if (value && typeof value === "object")
        return Object.values(value).some(containsScriptUrl);
    return false;
}
const imageTypes = [
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
];
const contentTypes = {
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
};
// Returns the file inside `dir` for a URL path, or null if it is missing, malformed or escapes `dir`.
function fileIn(dir, urlPath) {
    let decoded;
    try {
        decoded = decodeURIComponent(urlPath);
    }
    catch (_a) {
        return null;
    }
    const file = (0, node_path_1.resolve)(dir, "." + decoded);
    if (file !== dir && !file.startsWith(dir + node_path_1.sep))
        return null;
    return (0, node_fs_1.existsSync)(file) && (0, node_fs_1.statSync)(file).isFile() ? file : null;
}
// Streams a file, answering 304 when the browser already has this version.
function sendFile(c, file, headers = {}) {
    var _a;
    const stats = (0, node_fs_1.statSync)(file);
    const lastModified = new Date(Math.floor(stats.mtimeMs / 1000) * 1000);
    const since = c.req.header("if-modified-since");
    const common = Object.assign({ "Last-Modified": lastModified.toUTCString() }, headers);
    if (since && new Date(since).getTime() >= lastModified.getTime()) {
        return new Response(null, { status: 304, headers: common });
    }
    const stream = node_stream_1.Readable.toWeb((0, node_fs_1.createReadStream)(file));
    return new Response(stream, {
        headers: Object.assign({ "Content-Type": (_a = contentTypes[(0, node_path_1.extname)(file).toLowerCase()]) !== null && _a !== void 0 ? _a : "application/octet-stream", "Content-Length": String(stats.size) }, common),
    });
}
const str = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const messageFields = {
    firstName: "your first name",
    lastName: "your last name",
    email: "your email",
    phone: "your phone number",
    company: "your company name",
    preferredContactTime: "a preferred contact time",
};
// "_fbp=fb.1.123; other=x" -> value of `name`.
const cookieValue = (header, name) => {
    var _a;
    return (_a = header === null || header === void 0 ? void 0 : header.split(";").map((part) => part.trim().split("=")).find(([key]) => key === name)) === null || _a === void 0 ? void 0 : _a[1];
};
function createApp() {
    const app = new hono_1.Hono();
    app.use("*", (c, next) => __awaiter(this, void 0, void 0, function* () {
        yield next();
        c.header("X-Content-Type-Options", "nosniff");
        c.header("Referrer-Policy", "strict-origin-when-cross-origin");
        c.header("X-Frame-Options", "SAMEORIGIN");
    }));
    app.use("/api/*", auth_ts_1.sameOrigin);
    app.use("/api/*", (c, next) => __awaiter(this, void 0, void 0, function* () {
        yield next();
        c.header("Cache-Control", "no-store");
    }));
    // Request size caps: images and the content document are big, everything else is small.
    const tooLarge = (c) => c.json({ error: "The request is too large." }, 413);
    app.use("/api/uploads", (0, body_limit_1.bodyLimit)({ maxSize: config_ts_1.config.maxUploadBytes + 64 * 1024, onError: tooLarge }));
    app.use("/api/content", (0, body_limit_1.bodyLimit)({ maxSize: config_ts_1.config.maxContentBytes, onError: tooLarge }));
    app.use("/api/*", (c, next) => __awaiter(this, void 0, void 0, function* () {
        if (c.req.path === "/api/uploads" || c.req.path === "/api/content")
            return next();
        return (0, body_limit_1.bodyLimit)({ maxSize: 64 * 1024, onError: tooLarge })(c, next);
    }));
    // ---- Content ----------------------------------------------------------
    app.get("/api/content", (c) => {
        const row = db_ts_1.db.prepare("SELECT json FROM content WHERE id = 1").get();
        return c.json({ content: row ? JSON.parse(row.json) : null });
    });
    app.put("/api/content", auth_ts_1.requireAdmin, (c) => __awaiter(this, void 0, void 0, function* () {
        const raw = yield c.req.text();
        let content;
        try {
            content = JSON.parse(raw);
        }
        catch (_a) {
            return c.json({ error: "Invalid JSON." }, 400);
        }
        if (!content || typeof content !== "object" || Array.isArray(content)) {
            return c.json({ error: "Content must be an object." }, 400);
        }
        if (containsScriptUrl(content))
            return c.json({ error: "Script links are not allowed." }, 400);
        const updatedAt = new Date().toISOString();
        const saved = Object.assign(Object.assign({}, content), { updatedAt });
        db_ts_1.db.prepare(`INSERT INTO content (id, json, updated_at) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`).run(JSON.stringify(saved), updatedAt);
        return c.json({ content: saved });
    }));
    // ---- Auth -------------------------------------------------------------
    app.post("/api/auth/login", (c) => __awaiter(this, void 0, void 0, function* () {
        const ip = clientIp(c);
        if (loginLimiter.isLimited(ip)) {
            return c.json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
        }
        const body = (yield c.req.json().catch(() => ({})));
        const email = str(body.email, 200);
        const password = typeof body.password === "string" ? body.password : "";
        const admin = db_ts_1.db.prepare("SELECT id, email, name, avatar, password_hash FROM admins WHERE email = ?").get(email);
        if (!admin || !(yield (0, auth_ts_1.verifyPassword)(password, admin.password_hash))) {
            loginLimiter.hit(ip);
            return c.json({ error: "Wrong email or password." }, 401);
        }
        loginLimiter.reset(ip);
        (0, auth_ts_1.startSession)(c, admin.id);
        return c.json({ admin: { id: admin.id, email: admin.email, name: admin.name, avatar: admin.avatar } });
    }));
    app.post("/api/auth/logout", (c) => {
        (0, auth_ts_1.endSession)(c);
        return c.json({ ok: true });
    });
    app.get("/api/auth/me", (c) => {
        const admin = (0, auth_ts_1.currentAdmin)(c);
        return admin ? c.json({ admin }) : c.json({ error: "Not signed in." }, 401);
    });
    app.put("/api/auth/profile", auth_ts_1.requireAdmin, (c) => __awaiter(this, void 0, void 0, function* () {
        const body = (yield c.req.json().catch(() => ({})));
        const name = str(body.name, 100);
        const avatar = str(body.avatar, 500);
        // Only images on this site (or none) can be used as the profile photo.
        if (avatar && !avatar.startsWith("/uploads/") && !avatar.startsWith("/assets/")) {
            return c.json({ error: "Upload the photo instead of linking to it." }, 400);
        }
        const admin = c.get("admin");
        db_ts_1.db.prepare("UPDATE admins SET name = ?, avatar = ? WHERE id = ?").run(name, avatar, admin.id);
        return c.json({ admin: Object.assign(Object.assign({}, admin), { name, avatar }) });
    }));
    app.post("/api/auth/password", auth_ts_1.requireAdmin, (c) => __awaiter(this, void 0, void 0, function* () {
        const body = (yield c.req.json().catch(() => ({})));
        const current = typeof body.currentPassword === "string" ? body.currentPassword : "";
        const next = typeof body.newPassword === "string" ? body.newPassword : "";
        if (next.length < 10)
            return c.json({ error: "The new password needs at least 10 characters." }, 400);
        const admin = c.get("admin");
        const row = db_ts_1.db.prepare("SELECT password_hash FROM admins WHERE id = ?").get(admin.id);
        if (!(yield (0, auth_ts_1.verifyPassword)(current, row.password_hash))) {
            return c.json({ error: "The current password is wrong." }, 400);
        }
        db_ts_1.db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(yield (0, auth_ts_1.hashPassword)(next), admin.id);
        // Sign out every other device.
        db_ts_1.db.prepare("DELETE FROM sessions WHERE admin_id = ?").run(admin.id);
        (0, auth_ts_1.startSession)(c, admin.id);
        return c.json({ ok: true });
    }));
    // ---- Uploads ----------------------------------------------------------
    app.post("/api/uploads", auth_ts_1.requireAdmin, (c) => __awaiter(this, void 0, void 0, function* () {
        const body = yield c.req.parseBody();
        const file = body.file;
        if (!(file instanceof File))
            return c.json({ error: "No file was sent." }, 400);
        if (file.size > config_ts_1.config.maxUploadBytes)
            return c.json({ error: "Images must be 5 MB or smaller." }, 413);
        const bytes = Buffer.from(yield file.arrayBuffer());
        const kind = imageTypes.find((type) => type.test(bytes));
        if (!kind)
            return c.json({ error: "Only PNG, JPG, WebP, GIF or SVG images can be uploaded." }, 400);
        const name = `${Date.now().toString(36)}-${(0, node_crypto_1.randomBytes)(6).toString("hex")}${kind.ext}`;
        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(config_ts_1.config.uploadsDir, name), bytes);
        return c.json({ url: `/uploads/${name}` });
    }));
    app.get("/uploads/*", (c) => {
        const file = fileIn(config_ts_1.config.uploadsDir, c.req.path.slice("/uploads".length));
        if (!file)
            return c.notFound();
        return sendFile(c, file, {
            "Cache-Control": "public, max-age=31536000, immutable",
            // Uploaded SVGs can contain scripts; never let them run on this site.
            "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
            "X-Content-Type-Options": "nosniff",
        });
    });
    // ---- Contact messages -------------------------------------------------
    app.post("/api/messages", (c) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const ip = clientIp(c);
        if (messageLimiter.isLimited(ip)) {
            return c.json({ error: "Too many messages. Please try again later." }, 429);
        }
        const body = (yield c.req.json().catch(() => ({})));
        // Hidden field that people never fill in; bots usually do.
        if (str(body.website, 200))
            return c.json({ ok: true });
        const message = {
            firstName: str(body.firstName, 100),
            lastName: str(body.lastName, 100),
            email: str(body.email, 200),
            phone: str(body.phone, 50),
            company: str(body.company, 200),
            preferredContactTime: str(body.preferredContactTime, 50),
            message: str(body.message, 5000),
        };
        const missing = Object.keys(messageFields).find((key) => !message[key]);
        if (missing)
            return c.json({ error: `Please enter ${messageFields[missing]}.` }, 400);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) {
            return c.json({ error: "Please enter a valid email." }, 400);
        }
        messageLimiter.hit(ip);
        db_ts_1.db.prepare(`INSERT INTO messages (first_name, last_name, email, phone, company, preferred_time, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(message.firstName, message.lastName, message.email, message.phone, message.company, message.preferredContactTime, message.message, new Date().toISOString());
        // Server-side copy of the Pixel "Lead" (does nothing until the Conversions API is set up).
        void (0, meta_ts_1.sendMetaLead)({
            eventId: str(body.eventId, 64),
            email: message.email,
            phone: message.phone,
            firstName: message.firstName,
            lastName: message.lastName,
            ip,
            userAgent: (_a = c.req.header("user-agent")) !== null && _a !== void 0 ? _a : "",
            sourceUrl: (_b = c.req.header("referer")) !== null && _b !== void 0 ? _b : "",
            fbp: cookieValue(c.req.header("cookie"), "_fbp"),
            fbc: cookieValue(c.req.header("cookie"), "_fbc"),
        }).catch(() => undefined);
        return c.json({ ok: true }, 201);
    }));
    // ?limit=N returns only the newest N; `unread` always counts every unread message.
    app.get("/api/messages", auth_ts_1.requireAdmin, (c) => {
        const requested = c.req.query("limit");
        const limit = requested === undefined ? 500 : Math.min(500, Math.max(0, Math.floor(Number(requested)) || 0));
        const rows = db_ts_1.db
            .prepare(`SELECT id, first_name AS firstName, last_name AS lastName, email, phone, company,
                preferred_time AS preferredContactTime, message, created_at AS createdAt, is_read AS isRead
         FROM messages ORDER BY id DESC LIMIT ?`)
            .all(limit);
        const unread = db_ts_1.db.prepare("SELECT COUNT(*) AS count FROM messages WHERE is_read = 0").get().count;
        return c.json({ messages: rows.map((row) => (Object.assign(Object.assign({}, row), { isRead: row.isRead === 1 }))), unread });
    });
    app.patch("/api/messages/:id", auth_ts_1.requireAdmin, (c) => __awaiter(this, void 0, void 0, function* () {
        const body = (yield c.req.json().catch(() => ({})));
        db_ts_1.db.prepare("UPDATE messages SET is_read = ? WHERE id = ?").run(body.isRead ? 1 : 0, Number(c.req.param("id")));
        return c.json({ ok: true });
    }));
    app.delete("/api/messages/:id", auth_ts_1.requireAdmin, (c) => {
        db_ts_1.db.prepare("DELETE FROM messages WHERE id = ?").run(Number(c.req.param("id")));
        return c.json({ ok: true });
    });
    // ---- Visit statistics ------------------------------------------------
    app.post("/api/track", (c) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const ip = clientIp(c);
        // Your own browsing while signed in to the dashboard is not counted.
        if (trackLimiter.isLimited(ip) || (0, auth_ts_1.currentAdmin)(c))
            return c.body(null, 204);
        trackLimiter.hit(ip);
        const body = (yield c.req.json().catch(() => ({})));
        (0, stats_ts_1.recordPageView)({
            path: str(body.path, 200),
            referrer: str(body.referrer, 500),
            landing: body.landing === true,
            ip,
            userAgent: (_a = c.req.header("user-agent")) !== null && _a !== void 0 ? _a : "",
            host: (_b = c.req.header("host")) !== null && _b !== void 0 ? _b : "",
        });
        return c.body(null, 204);
    }));
    app.get("/api/stats", auth_ts_1.requireAdmin, (c) => {
        const days = Math.min(365, Math.max(7, Number(c.req.query("days")) || 30));
        return c.json((0, stats_ts_1.statsFor)(days));
    });
    // ---- Tracking (private part) -----------------------------------------
    // The Conversions API token stays on the server; the dashboard only learns whether it is set.
    app.get("/api/tracking", auth_ts_1.requireAdmin, (c) => c.json({ meta: (0, meta_ts_1.publicMetaStatus)() }));
    app.put("/api/tracking/meta", auth_ts_1.requireAdmin, (c) => __awaiter(this, void 0, void 0, function* () {
        const body = (yield c.req.json().catch(() => ({})));
        const current = (0, meta_ts_1.metaSettings)();
        // accessToken: a string replaces it, null removes it, missing keeps it.
        const accessToken = body.accessToken === null ? "" : typeof body.accessToken === "string" ? body.accessToken.trim() : current.accessToken;
        if (accessToken && !/^[A-Za-z0-9_-]{20,500}$/.test(accessToken)) {
            return c.json({ error: "That does not look like a Meta access token." }, 400);
        }
        const testEventCode = str(body.testEventCode, 40);
        if (testEventCode && !/^[A-Za-z0-9]+$/.test(testEventCode))
            return c.json({ error: "Test event codes contain only letters and numbers." }, 400);
        (0, meta_ts_1.saveMetaSettings)({ accessToken, testEventCode });
        return c.json({ meta: (0, meta_ts_1.publicMetaStatus)() });
    }));
    app.all("/api/*", (c) => c.json({ error: "Not found." }, 404));
    // ---- Website (production) --------------------------------------------
    // Serves the built site; any other path gets index.html so the app can route it.
    app.get("*", (c) => {
        const indexFile = (0, node_path_1.join)(config_ts_1.config.distDir, "index.html");
        if (!(0, node_fs_1.existsSync)(indexFile))
            return c.text("Website build not found. Run `pnpm build`.", 404);
        const file = c.req.path === "/" ? null : fileIn(config_ts_1.config.distDir, c.req.path);
        if (file) {
            const hashed = c.req.path.startsWith("/assets/index-") || /-[A-Za-z0-9_-]{8}\.(js|css)$/.test(file);
            return sendFile(c, file, { "Cache-Control": hashed ? "public, max-age=31536000, immutable" : "public, max-age=3600" });
        }
        return sendFile(c, indexFile, { "Cache-Control": "no-cache" });
    });
    return app;
}
