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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastMetaResult = exports.metaSettings = void 0;
exports.saveMetaSettings = saveMetaSettings;
exports.publicMetaStatus = publicMetaStatus;
exports.sendMetaLead = sendMetaLead;
// Meta Conversions API: sends the contact form "Lead" from the server as well, so it is
// counted even when ad blockers stop the browser Pixel. The browser and server events
// share an event ID, which Meta uses to count them once.
const node_crypto_1 = require("node:crypto");
const db_ts_1 = require("./db.ts");
const GRAPH_VERSION = (_a = process.env.META_GRAPH_VERSION) !== null && _a !== void 0 ? _a : "v23.0";
function readSetting(key, fallback) {
    const row = db_ts_1.db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
    if (!row)
        return fallback;
    try {
        return Object.assign(Object.assign({}, fallback), JSON.parse(row.value));
    }
    catch (_a) {
        return fallback;
    }
}
function writeSetting(key, value) {
    db_ts_1.db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, JSON.stringify(value));
}
const metaSettings = () => readSetting("meta_capi", { accessToken: "", testEventCode: "" });
exports.metaSettings = metaSettings;
function saveMetaSettings(next) {
    writeSetting("meta_capi", next);
}
const lastMetaResult = () => readSetting("meta_capi_last", null);
exports.lastMetaResult = lastMetaResult;
// What the dashboard may see: never the token itself.
function publicMetaStatus() {
    const settings = (0, exports.metaSettings)();
    return { tokenSet: settings.accessToken !== "", testEventCode: settings.testEventCode, lastResult: (0, exports.lastMetaResult)() };
}
// Pixel ID and on/off switch live in the public site content.
function pixelFromContent() {
    var _a, _b, _c, _d;
    const row = db_ts_1.db.prepare("SELECT json FROM content WHERE id = 1").get();
    if (!row)
        return null;
    try {
        const tracking = (_b = (_a = JSON.parse(row.json)) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.tracking;
        // Same rule as the website (src/content/store.ts): saves from before the switch
        // existed count a filled-in ID as on.
        const enabled = (_c = tracking === null || tracking === void 0 ? void 0 : tracking.metaPixelEnabled) !== null && _c !== void 0 ? _c : Boolean(tracking === null || tracking === void 0 ? void 0 : tracking.metaPixelId);
        if (!enabled || !/^\d{10,20}$/.test((_d = tracking === null || tracking === void 0 ? void 0 : tracking.metaPixelId) !== null && _d !== void 0 ? _d : ""))
            return null;
        return tracking.metaPixelId;
    }
    catch (_e) {
        return null;
    }
}
const sha256 = (value) => (0, node_crypto_1.createHash)("sha256").update(value).digest("hex");
function sendMetaLead(lead) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const pixelId = pixelFromContent();
        const { accessToken, testEventCode } = (0, exports.metaSettings)();
        if (!pixelId || !accessToken)
            return;
        const userData = {
            em: [sha256(lead.email.trim().toLowerCase())],
            fn: [sha256(lead.firstName.trim().toLowerCase())],
            ln: [sha256(lead.lastName.trim().toLowerCase())],
            client_user_agent: lead.userAgent,
        };
        const digits = lead.phone.replace(/\D/g, "");
        if (digits)
            userData.ph = [sha256(digits)];
        if (lead.ip && lead.ip !== "unknown")
            userData.client_ip_address = lead.ip;
        if (lead.fbp)
            userData.fbp = lead.fbp;
        if (lead.fbc)
            userData.fbc = lead.fbc;
        const body = {
            data: [
                {
                    event_name: "Lead",
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: lead.eventId || undefined,
                    action_source: "website",
                    event_source_url: lead.sourceUrl || undefined,
                    user_data: userData,
                },
            ],
        };
        if (testEventCode)
            body.test_event_code = testEventCode;
        let result;
        try {
            const response = yield fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(10000),
            });
            const data = (yield response.json().catch(() => ({})));
            result = response.ok
                ? { ok: true, at: new Date().toISOString(), message: `Lead sent (${(_a = data.events_received) !== null && _a !== void 0 ? _a : 1} event received).` }
                : { ok: false, at: new Date().toISOString(), message: (_c = (_b = data.error) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : `Meta answered ${response.status}.` };
        }
        catch (error) {
            result = { ok: false, at: new Date().toISOString(), message: error instanceof Error ? error.message : "Could not reach Meta." };
        }
        writeSetting("meta_capi_last", result);
    });
}
