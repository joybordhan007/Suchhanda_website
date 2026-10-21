import { serve } from "@hono/node-server"
import { createApp } from "./app.ts"
import { deleteExpiredSessions } from "./auth.ts"
import { config } from "./config.ts"
import { db } from "./db.ts"
import { pruneOldPageViews } from "./stats.ts"

const app = createApp()

deleteExpiredSessions()
setInterval(deleteExpiredSessions, 60 * 60 * 1000).unref()
pruneOldPageViews()
setInterval(pruneOldPageViews, 24 * 60 * 60 * 1000).unref()

const adminCount = (db.prepare("SELECT COUNT(*) AS count FROM admins").get() as { count: number }).count
if (adminCount === 0) {
  console.warn("No admin account yet. Create one with: pnpm admin:create")
}

serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (info) => {
  console.log(`API server listening on http://${config.host}:${info.port} (data: ${config.dataDir})`)
})
