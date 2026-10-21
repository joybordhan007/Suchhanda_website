"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPageView = recordPageView;
exports.pruneOldPageViews = pruneOldPageViews;
exports.statsFor = statsFor;
const node_crypto_1 = require("node:crypto");
const db_ts_1 = require("./db.ts");
// Secret mixed into visitor hashes so they can't be reversed into IP addresses.
function hashSecret() {
    const row = db_ts_1.db.prepare("SELECT value FROM settings WHERE key = 'visitor_secret'").get();
    if (row)
        return row.value;
    const value = (0, node_crypto_1.randomBytes)(32).toString("hex");
    db_ts_1.db.prepare("INSERT INTO settings (key, value) VALUES ('visitor_secret', ?)").run(value);
    return value;
}
const secret = hashSecret();
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios/i;
const RETENTION_DAYS = 400;
const INTERNAL_SOURCE = "(internal)";
const today = () => new Date().toISOString().slice(0, 10);
// "https://www.google.com/search?q=…" -> "google.com"; same-site and empty -> "Direct".
function sourceOf(referrer, ownHost) {
    try {
        const host = new URL(referrer).hostname.replace(/^www\./, "");
        if (!host || host === ownHost.replace(/^www\./, "").split(":")[0])
            return "Direct";
        if (/(^|\.)(facebook|fb|instagram|messenger)\.com$|^l\.facebook\.com$|^lm\.facebook\.com$/.test(host))
            return "Facebook / Instagram";
        if (/(^|\.)google\./.test(host))
            return "Google";
        if (/(^|\.)linkedin\.com$|^lnkd\.in$/.test(host))
            return "LinkedIn";
        if (/(^|\.)(t\.co|x\.com|twitter\.com)$/.test(host))
            return "X (Twitter)";
        if (/(^|\.)(bing|duckduckgo|yahoo)\./.test(host))
            return "Other search";
        return host;
    }
    catch (_a) {
        return "Direct";
    }
}
function recordPageView({ path, referrer, landing, ip, userAgent, host, }) {
    if (!userAgent || BOT_PATTERN.test(userAgent))
        return false;
    if (!/^\/[a-z0-9\-/]{0,200}$/.test(path) || path.startsWith("/admin"))
        return false;
    const day = today();
    const visitor = (0, node_crypto_1.createHash)("sha256").update(`${secret}|${day}|${ip}|${userAgent}`).digest("hex").slice(0, 20);
    db_ts_1.db.prepare("INSERT INTO page_views (day, path, source, visitor, created_at) VALUES (?, ?, ?, ?, ?)").run(day, path, landing ? sourceOf(referrer, host) : INTERNAL_SOURCE, visitor, new Date().toISOString());
    return true;
}
function pruneOldPageViews() {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400000).toISOString().slice(0, 10);
    db_ts_1.db.prepare("DELETE FROM page_views WHERE day < ?").run(cutoff);
}
function dayList(days, endOffset = 0) {
    const list = [];
    for (let index = days - 1; index >= 0; index--) {
        list.push(new Date(Date.now() - (index + endOffset) * 86400000).toISOString().slice(0, 10));
    }
    return list;
}
function totals(from, to) {
    const views = db_ts_1.db
        .prepare("SELECT COUNT(*) AS views, COUNT(DISTINCT day || visitor) AS visitors FROM page_views WHERE day BETWEEN ? AND ?")
        .get(from, to);
    const messages = db_ts_1.db
        .prepare("SELECT COUNT(*) AS count FROM messages WHERE substr(created_at, 1, 10) BETWEEN ? AND ?")
        .get(from, to);
    return { views: views.views, visitors: views.visitors, messages: messages.count };
}
// Everything the dashboard shows for the last `days` days, plus the period before
// it for comparison.
function statsFor(days) {
    const current = dayList(days);
    const previous = dayList(days, days);
    const from = current[0];
    const to = current[current.length - 1];
    const viewRows = db_ts_1.db
        .prepare("SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM page_views WHERE day BETWEEN ? AND ? GROUP BY day")
        .all(from, to);
    const messageRows = db_ts_1.db
        .prepare("SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS messages FROM messages WHERE substr(created_at, 1, 10) BETWEEN ? AND ? GROUP BY day")
        .all(from, to);
    const viewsByDay = new Map(viewRows.map((row) => [row.day, row]));
    const messagesByDay = new Map(messageRows.map((row) => [row.day, row.messages]));
    const firstDay = db_ts_1.db.prepare("SELECT MIN(day) AS day FROM page_views").get().day;
    return {
        days,
        trackingSince: firstDay,
        daily: current.map((day) => {
            var _a, _b, _c, _d, _e;
            return ({
                day,
                views: (_b = (_a = viewsByDay.get(day)) === null || _a === void 0 ? void 0 : _a.views) !== null && _b !== void 0 ? _b : 0,
                visitors: (_d = (_c = viewsByDay.get(day)) === null || _c === void 0 ? void 0 : _c.visitors) !== null && _d !== void 0 ? _d : 0,
                messages: (_e = messagesByDay.get(day)) !== null && _e !== void 0 ? _e : 0,
            });
        }),
        totals: totals(from, to),
        previousTotals: totals(previous[0], previous[previous.length - 1]),
        topPages: db_ts_1.db
            .prepare("SELECT path, COUNT(*) AS views FROM page_views WHERE day BETWEEN ? AND ? GROUP BY path ORDER BY views DESC LIMIT 8")
            .all(from, to),
        sources: db_ts_1.db
            .prepare("SELECT source, COUNT(*) AS views FROM page_views WHERE day BETWEEN ? AND ? AND source != ? GROUP BY source ORDER BY views DESC LIMIT 6")
            .all(from, to, INTERNAL_SOURCE),
        unreadMessages: db_ts_1.db.prepare("SELECT COUNT(*) AS count FROM messages WHERE is_read = 0").get().count,
    };
}
