"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const app_ts_1 = require("./app.ts");
const auth_ts_1 = require("./auth.ts");
const config_ts_1 = require("./config.ts");
const db_ts_1 = require("./db.ts");
const stats_ts_1 = require("./stats.ts");
const app = (0, app_ts_1.createApp)();
(0, auth_ts_1.deleteExpiredSessions)();
setInterval(auth_ts_1.deleteExpiredSessions, 60 * 60 * 1000).unref();
(0, stats_ts_1.pruneOldPageViews)();
setInterval(stats_ts_1.pruneOldPageViews, 24 * 60 * 60 * 1000).unref();
const adminCount = db_ts_1.db.prepare("SELECT COUNT(*) AS count FROM admins").get().count;
if (adminCount === 0) {
    console.warn("No admin account yet. Create one with: pnpm admin:create");
}
(0, node_server_1.serve)({ fetch: app.fetch, port: config_ts_1.config.port, hostname: config_ts_1.config.host }, (info) => {
    console.log(`API server listening on http://${config_ts_1.config.host}:${info.port} (data: ${config_ts_1.config.dataDir})`);
});
